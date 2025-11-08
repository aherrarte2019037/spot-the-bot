import { createErrorResponse, createSuccessResponse, createSupabaseClient, requireAuth } from "../_shared/utils.ts";

interface GetGameResultsRequest {
  game_id: number;
  profile_id: string;
}

Deno.serve(async (req) => {
  try {
    const authError = requireAuth(req);
    if (authError) return authError;

    const supabase = createSupabaseClient();

    const { game_id, profile_id }: GetGameResultsRequest = await req.json();

    if (!game_id || !profile_id) {
      return createErrorResponse("Missing required fields: game_id, profile_id", 400);
    }

    const { data: playerResult, error: playerError } = await supabase
      .from("game_results_view")
      .select("*")
      .eq("game_id", game_id)
      .eq("profile_id", profile_id)
      .eq("is_bot", false)
      .single()

    if (playerError || !playerResult) {
      return createErrorResponse("Player not found in game", 404);
    }

    const { data: botPlayersData, error: botPlayersError } = await supabase
      .from("game_bot_players_view")
      .select("bot_player_names")
      .eq("game_id", game_id)
      .single()

    if (botPlayersError || !botPlayersData) {
      return createErrorResponse("Bot players not found", 404);
    }

    const botPlayerNames = botPlayersData.bot_player_names || [];

    const { data: allPlayersResults, error: allPlayersResultsError } = await supabase
      .from("game_results_view")
      .select("guessed_correctly, is_bot")
      .eq("game_id", game_id)

    if (allPlayersResultsError || !allPlayersResults) {
      return createErrorResponse("All players results not found", 404);
    }

    const totalCorrectPlayers = allPlayersResults.filter(
      (p) => p.guessed_correctly === true && p.is_bot === false
    ).length;

    return createSuccessResponse(
      {
        botPlayers: botPlayerNames,
        currentPlayerCorrectVotes: playerResult.correct_votes,
        currentPlayerTotalVotes: playerResult.total_votes,
        currentPlayerScore: playerResult.score,
        xpGained: playerResult.xp_gained,
        totalCorrectPlayers,
      },
      "Results retrieved successfully"
    );
  } catch {
    return createErrorResponse("Failed to get game results", 500);
  }
});

