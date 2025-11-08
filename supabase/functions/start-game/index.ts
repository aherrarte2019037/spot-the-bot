import { serve } from "deno";
import type { TablesUpdate } from "../_shared/database.types.ts";
import { createErrorResponse, createSuccessResponse, createSupabaseClient, requireAuth } from "../_shared/utils.ts";
import type { GameStatus } from "../_shared/schemas.ts";

interface StartGameRequest {
  game_id: number;
}

serve(async (req) => {
  try {
    const authError = requireAuth(req);
    if (authError) return authError;

    const supabase = createSupabaseClient();

    const { game_id }: StartGameRequest = await req.json();

    if (!game_id) {
      return createErrorResponse("Missing game_id", 400);
    }

    // 1. Validate game exists and is in waiting status
    const { data: game, error: gameError } = await supabase
      .from("games")
      .select("status")
      .eq("id", game_id)
      .single();

    if (gameError || !game) {
      return createErrorResponse("Game not found", 404);
    }

    const currentStatus = game.status as GameStatus;
    if (currentStatus !== "waiting") {
      return createErrorResponse(`Game is not in waiting status (current: ${currentStatus})`, 400);
    }

    // 2. Update game to chatting status with started_at timestamp
    const startedAt = new Date().toISOString();
    const gameUpdate: TablesUpdate<"games"> = {
      status: "chatting" as GameStatus,
      started_at: startedAt,
    };
    
    const { data: updatedGame, error: updateError } = await supabase
      .from("games")
      .update(gameUpdate)
      .eq("id", game_id)
      .select()
      .single();

    if (updateError) {
      return createErrorResponse(`Failed to start game: ${updateError.message}`, 500);
    }

    return createSuccessResponse({ game: updatedGame }, "Game started successfully");
  } catch {
    return createErrorResponse("Failed to start game", 500);
  }
});

