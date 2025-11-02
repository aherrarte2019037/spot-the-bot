import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import type { Database } from "../_shared/database.types.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

interface GetGameResultsRequest {
  game_id: number;
  profile_id: string;
}

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

    const { game_id, profile_id }: GetGameResultsRequest = await req.json();

    if (!game_id || !profile_id) {
      return new Response(
        JSON.stringify({ success: false, data: null, message: "Missing required fields: game_id, profile_id" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Get game with players and votes
    const { data: game, error: gameError } = await supabase
      .from("games")
      .select(`
        *,
        players:game_players(
          *,
          profile:profiles(user_name, email, avatar_url)
        ),
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

    // Find current player
    const currentPlayer = players.find((p) => p.profile_id === profile_id && !p.is_bot);
    if (!currentPlayer) {
      return new Response(
        JSON.stringify({ success: false, data: null, message: "Player not found in game" }),
        { status: 404, headers: corsHeaders }
      );
    }

    // Identify bot players
    const botPlayers = players.filter((p) => p.is_bot);
    const botPlayerIds = new Set(botPlayers.map((p) => p.id));
    const botPlayerNames = botPlayers.map((p) => {
      if (p.is_bot && p.bot_username) {
        return p.bot_username;
      }
      return "Unknown";
    });

    // Get current player's votes
    const currentPlayerVotes = votes.filter((v) => v.voter_id === currentPlayer.id);
    const correctVotes = currentPlayerVotes.filter((v) =>
      v.target_id !== null && botPlayerIds.has(v.target_id)
    );

    // Get current player's score
    const currentPlayerScore = currentPlayer.score;

    // Calculate XP gained (score / 10, minimum 10)
    const xpGained = Math.max(10, Math.floor(currentPlayerScore / 10));

    // Calculate total players who guessed correctly
    const humanPlayers = players.filter((p) => !p.is_bot);
    let totalCorrectPlayers = 0;

    for (const player of humanPlayers) {
      const playerVotes = votes.filter((v) => v.voter_id === player.id);
      const playerCorrectVotes = playerVotes.filter((v) =>
        v.target_id !== null && botPlayerIds.has(v.target_id)
      );
      if (playerCorrectVotes.length > 0) {
        totalCorrectPlayers++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          botPlayers: botPlayerNames,
          currentPlayerCorrectVotes: correctVotes.length,
          currentPlayerTotalVotes: currentPlayerVotes.length,
          currentPlayerScore,
          xpGained,
          totalCorrectPlayers,
        },
        message: "Results retrieved successfully"
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch {
    return new Response(
      JSON.stringify({ success: false, data: null, message: "Failed to get game results" }),
      { status: 500, headers: corsHeaders }
    );
  }
});

