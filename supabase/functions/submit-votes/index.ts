import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import type { Database, TablesInsert } from "../_shared/database.types.ts";

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

    // 8. If all voted, trigger results calculation via HTTP fetch
    if (allVoted) {
      await fetch(`${supabaseUrl}/functions/v1/calculate-results`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ game_id }),
      });
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

