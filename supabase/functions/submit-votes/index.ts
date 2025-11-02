import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import type { Database, TablesInsert, TablesUpdate } from "../_shared/database.types.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

serve(async (req) => {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, data: null, message: "Missing authorization header" }),
        { status: 401, headers: corsHeaders }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient<Database>(supabaseUrl, supabaseKey);

    const { game_id, voter_id, target_ids }: { game_id: number; voter_id: number; target_ids: number[] } = await req.json();

    if (!game_id || !voter_id || !target_ids || !Array.isArray(target_ids)) {
      return new Response(
        JSON.stringify({ success: false, data: null, message: "Missing required fields: game_id, voter_id, target_ids" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const { data: game, error: gameError } = await supabase
      .from("games")
      .select("*, players:game_players(*)")
      .eq("id", game_id)
      .single();

    if (gameError || !game) {
      return new Response(
        JSON.stringify({ success: false, data: null, message: "Game not found" }),
        { status: 404, headers: corsHeaders }
      );
    }

    if (game.status !== "voting") {
      return new Response(
        JSON.stringify({ success: false, data: null, message: "Game is not in voting phase" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const players = game.players;

    const voter = players.find((p) => p.id === voter_id);
    if (!voter) {
      return new Response(
        JSON.stringify({ success: false, data: null, message: "Voter is not a player in this game" }),
        { status: 403, headers: corsHeaders }
      );
    }

    if (voter.is_bot) {
      return new Response(
        JSON.stringify({ success: false, data: null, message: "Bots cannot vote" }),
        { status: 403, headers: corsHeaders }
      );
    }

    if (target_ids.length !== game.bot_count) {
      return new Response(
        JSON.stringify({ success: false, data: null, message: `Must vote for exactly ${game.bot_count} players` }),
        { status: 400, headers: corsHeaders }
      );
    }

    const allPlayerIds = players.map((p) => p.id);
    const invalidTargets = target_ids.filter((id) => !allPlayerIds.includes(id));
    if (invalidTargets.length > 0) {
      return new Response(
        JSON.stringify({ success: false, data: null, message: "Invalid target player IDs" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // 5. Check if voter has already voted
    const { data: existingVotes } = await supabase
      .from("votes")
      .select("id")
      .eq("game_id", game_id)
      .eq("voter_id", voter_id)
      .limit(1);

    if (existingVotes && existingVotes.length > 0) {
      return new Response(
        JSON.stringify({ success: false, data: null, message: "You have already voted" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // 6. Insert all votes
    const votesToInsert: TablesInsert<"votes">[] = target_ids.map((target_id) => ({
      game_id,
      voter_id,
      target_id,
    }));

    const { data: votes, error: votesError } = await supabase
      .from("votes")
      .insert(votesToInsert)
      .select();

    if (votesError) {
      return new Response(
        JSON.stringify({ success: false, data: null, message: `Failed to submit votes: ${votesError.message}` }),
        { status: 500, headers: corsHeaders }
      );
    }

    // 7. Check if all human players have voted
    const humanPlayers = players.filter((p) => !p.is_bot);
    const { data: allVotes } = await supabase
      .from("votes")
      .select("voter_id")
      .eq("game_id", game_id);

    const uniqueVoters = new Set(allVotes?.map((v) => v.voter_id) || []);
    const allVoted = humanPlayers.every((p) => uniqueVoters.has(p.id));

    // 8. If all voted, calculate results and update game status
    if (allVoted) {
      try {
        // Get all votes for the game
        const { data: allGameVotes } = await supabase
          .from("votes")
          .select("*")
          .eq("game_id", game_id);

        if (allGameVotes) {
          // Identify bot players
          const botPlayers = players.filter((p) => p.is_bot);
          const botPlayerIds = new Set(botPlayers.map((p) => p.id));

          // Calculate scores for each human player
          const scores: Array<{
            player_id: number;
            correct_votes: number;
            total_votes: number;
            score: number;
          }> = [];

          for (const player of humanPlayers) {
            // Get votes cast by this player
            const playerVotes = allGameVotes.filter((v) => v.voter_id === player.id);

            // Count correct votes (votes for actual bots)
            const correctVotes = playerVotes.filter((v) => v.target_id !== null && botPlayerIds.has(v.target_id)).length;

            // Calculate score (e.g., 100 points per correct vote)
            const score = correctVotes * 100;

            scores.push({
              player_id: player.id,
              correct_votes: correctVotes,
              total_votes: playerVotes.length,
              score,
            });
          }

          // Update player scores in game_players
          for (const scoreData of scores) {
            const scoreUpdate: TablesUpdate<"game_players"> = { score: scoreData.score };
            await supabase
              .from("game_players")
              .update(scoreUpdate)
              .eq("id", scoreData.player_id);
          }

          // Update profiles with XP (calculate XP based on score)
          for (const scoreData of scores) {
            const player = humanPlayers.find((p) => p.id === scoreData.player_id);
            if (player?.profile_id) {
              // Get current XP
              const { data: profile } = await supabase
                .from("profiles")
                .select("xp")
                .eq("id", player.profile_id)
                .single();

              if (profile) {
                // Award XP (e.g., score / 10, minimum 10 XP per game)
                const xpGained = Math.max(10, Math.floor(scoreData.score / 10));
                const newXp = profile.xp + xpGained;

                // Update profile XP and let trigger calculate level
                const profileUpdate: TablesUpdate<"profiles"> = { xp: newXp };
                await supabase
                  .from("profiles")
                  .update(profileUpdate)
                  .eq("id", player.profile_id);
              }
            }
          }

          // Update game status to completed
          const gameUpdate: TablesUpdate<"games"> = { status: "completed" };
          await supabase
            .from("games")
            .update(gameUpdate)
            .eq("id", game_id);
        }
      } catch (_error) {
        return new Response(
          JSON.stringify({ success: false, data: null, message: "Failed to calculate results" }),
          { status: 500, headers: corsHeaders }
        );
      }
    }

    return new Response(
      JSON.stringify({ success: true, data: { votes }, message: "Votes submitted successfully" }),
      { status: 200, headers: corsHeaders }
    );
  } catch {
    return new Response(
      JSON.stringify({ success: false, data: null, message: "Failed to submit votes" }),
      { status: 500, headers: corsHeaders }
    );
  }
});

