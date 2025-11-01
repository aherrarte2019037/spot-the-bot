import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import type { Database, TablesUpdate } from "../_shared/database.types.ts";

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

    const { game_id }: { game_id: number } = await req.json();

    if (!game_id) {
      return new Response(
        JSON.stringify({ success: false, data: null, message: "Missing game_id" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // 1. Get game with players and votes
    const { data: game, error: gameError } = await supabase
      .from("games")
      .select(`
        *,
        players:game_players(*),
        votes(*)
      `)
      .eq("id", game_id)
      .single();

    if (gameError || !game) {
      return new Response(
        JSON.stringify({ success: false, data: null, message: "Game not found" }),
        { status: 404, headers: corsHeaders }
      );
    }

    const players = game.players;
    const votes = game.votes;
    
    // 2. Identify bot players
    const botPlayers = players.filter((p) => p.is_bot);
    const botPlayerIds = new Set(botPlayers.map((p) => p.id));

    // 3. Calculate scores for each human player
    const humanPlayers = players.filter((p) => !p.is_bot);
    const scores: Array<{
      player_id: number;
      correct_votes: number;
      total_votes: number;
      score: number;
    }> = [];

    for (const player of humanPlayers) {
      // Get votes cast by this player
      const playerVotes = votes.filter((v) => v.voter_id === player.id);

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

    // 4. Update player scores in game_players
    for (const scoreData of scores) {
      const scoreUpdate: TablesUpdate<"game_players"> = { score: scoreData.score };
      await supabase
        .from("game_players")
        .update(scoreUpdate)
        .eq("id", scoreData.player_id);
    }

    // 5. Update profiles with XP (calculate XP based on score)
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
          const profileData = profile;
          // Award XP (e.g., score / 10, minimum 10 XP per game)
          const xpGained = Math.max(10, Math.floor(scoreData.score / 10));
          const newXp = profileData.xp + xpGained;

          // Update profile XP and let trigger calculate level
          const profileUpdate: TablesUpdate<"profiles"> = { xp: newXp };
          await supabase
            .from("profiles")
            .update(profileUpdate)
            .eq("id", player.profile_id);
        }
      }
    }

    // 6. Update game status to completed
    const gameUpdate: TablesUpdate<"games"> = { status: "completed" };
    const { data: updatedGame, error: updateError } = await supabase
      .from("games")
      .update(gameUpdate)
      .eq("id", game_id)
      .select()
      .single();

    if (updateError) {
      return new Response(
        JSON.stringify({ success: false, data: null, message: `Failed to complete game: ${updateError.message}` }),
        { status: 500, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          game: updatedGame,
          scores,
        },
        message: "Results calculated successfully"
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch {
    return new Response(
      JSON.stringify({ success: false, data: null, message: "Failed to calculate results" }),
      { status: 500, headers: corsHeaders }
    );
  }
});

