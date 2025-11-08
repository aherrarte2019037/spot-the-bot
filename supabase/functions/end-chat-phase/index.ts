import { serve } from "deno";
import type { TablesUpdate } from "../_shared/database.types.ts";
import { createErrorResponse, createSuccessResponse, createSupabaseClient, requireAuth } from "../_shared/utils.ts";

interface EndChatPhaseRequest {
  game_id: number;
}

serve(async (req) => {
  try {
    const authError = requireAuth(req);
    if (authError) return authError;

    const supabase = createSupabaseClient();

    const { game_id }: EndChatPhaseRequest = await req.json();

    if (!game_id) {
      return createErrorResponse("Missing game_id", 400);
    }

    // 1. Validate game exists and is in chatting status
    const { data: game, error: gameError } = await supabase
      .from("games")
      .select("status, started_at")
      .eq("id", game_id)
      .single();

    if (gameError || !game) {
      return createErrorResponse("Game not found", 404);
    }

    const currentStatus = game.status;
    if (currentStatus !== "chatting") {
      return createErrorResponse(`Game is not in chatting status (current: ${currentStatus})`, 400);
    }

    // 2. Update game to voting status with ended_at timestamp
    const endedAt = new Date().toISOString();
    const gameUpdate: TablesUpdate<"games"> = {
      status: "voting",
      ended_at: endedAt,
    };
    
    const { data: updatedGame, error: updateError } = await supabase
      .from("games")
      .update(gameUpdate)
      .eq("id", game_id)
      .select()
      .single();

    if (updateError) {
      return createErrorResponse(`Failed to end chat phase: ${updateError.message}`, 500);
    }

    return createSuccessResponse({ game: updatedGame }, "Chat phase ended successfully");
  } catch {
    return createErrorResponse("Failed to end chat phase", 500);
  }
});

