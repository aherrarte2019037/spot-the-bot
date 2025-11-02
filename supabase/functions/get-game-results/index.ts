import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createErrorResponse, createSuccessResponse, createSupabaseClient, requireAuth } from "../_shared/utils.ts";

interface GetGameResultsRequest {
  game_id: number;
  profile_id: string;
}

serve(async (req) => {
  try {
    const authError = requireAuth(req);
    if (authError) return authError;

    const supabase = createSupabaseClient();

    const { game_id, profile_id }: GetGameResultsRequest = await req.json();

    if (!game_id || !profile_id) {
      return createErrorResponse("Missing required fields: game_id, profile_id", 400);
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
      return createErrorResponse("Game not found", 404);
    }

    const players = game.players;
    const votes = game.votes;

    // Find current player
    const currentPlayer = players.find((p) => p.profile_id === profile_id && !p.is_bot);
    if (!currentPlayer) {
      return createErrorResponse("Player not found in game", 404);
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

    return createSuccessResponse(
      {
        botPlayers: botPlayerNames,
        currentPlayerCorrectVotes: correctVotes.length,
        currentPlayerTotalVotes: currentPlayerVotes.length,
        currentPlayerScore,
        xpGained,
        totalCorrectPlayers,
      },
      "Results retrieved successfully"
    );
  } catch {
    return createErrorResponse("Failed to get game results", 500);
  }
});

