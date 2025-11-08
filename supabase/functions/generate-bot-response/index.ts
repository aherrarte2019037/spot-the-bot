import type { TablesInsert } from "../_shared/database.types.ts";
import { createErrorResponse, createSuccessResponse, createSupabaseClient, requireAuth } from "../_shared/utils.ts";
import { AIService } from "../_shared/aiService.ts";

interface GenerateBotResponseRequest {
  game_id: number;
  bot_player_id: number;
}

Deno.serve(async (req) => {
  try {
    const authError = requireAuth(req);
    if (authError) return authError;

    const supabase = createSupabaseClient();

    const { game_id, bot_player_id }: GenerateBotResponseRequest = await req.json();

    if (!game_id || !bot_player_id) {
      return createErrorResponse("Missing required fields: game_id, bot_player_id", 400);
    }

    // Get game info
    const { data: game, error: gameError } = await supabase
      .from("games")
      .select("*")
      .eq("id", game_id)
      .single();

    if (gameError || !game) {
      return createErrorResponse("Game not found", 404);
    }

    if (game.status !== "chatting") {
      return createErrorResponse("Game is not in chatting phase", 400);
    }

    // Get bot player info
    const { data: botPlayer, error: botError } = await supabase
      .from("game_players")
      .select("*")
      .eq("id", bot_player_id)
      .eq("game_id", game_id)
      .single();

    if (botError || !botPlayer || !botPlayer.is_bot) {
      return createErrorResponse("Bot player not found", 404);
    }

    // Check if bot has already sent a message recently (prevent spam)
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
    const { data: recentMessages } = await supabase
      .from("messages")
      .select("id")
      .eq("game_id", game_id)
      .eq("player_id", bot_player_id)
      .gte("created_at", oneMinuteAgo)
      .limit(1);

    if (recentMessages && recentMessages.length > 0) {
      return createErrorResponse("Bot already responded recently", 429);
    }

    // Get conversation history (last 10 messages)
    const { data: messages } = await supabase
      .from("messages")
      .select(`
        *,
        player:game_players(
          *,
          profile:profiles(user_name, email, avatar_url)
        )
      `)
      .eq("game_id", game_id)
      .order("created_at", { ascending: false })
      .limit(20);

    const conversationHistory = (messages || []).map((msg) => {
      return {
        player: msg.player,
        message: msg.content,
      };
    });

    // Initialize AI service
    let aiService: AIService;
    try {
      aiService = new AIService();
    } catch (error) {
      return createErrorResponse(
        `AI service configuration error: ${error}`,
        500
      );
    }

    const botMessage = await aiService.generateMessage({
      personality: botPlayer.bot_personality,
      topic: game.topic,
      conversationHistory,
    });

    // Insert bot message
    const messageToInsert: TablesInsert<"messages"> = {
      game_id,
      player_id: bot_player_id,
      content: botMessage,
      is_bot: true,
    };

    const { data: insertedMessage, error: insertError } = await supabase
      .from("messages")
      .insert(messageToInsert)
      .select()
      .single();

    if (insertError) {
      return createErrorResponse(`Failed to insert bot message: ${insertError.message}`, 500);
    }

    return createSuccessResponse(
      { message: insertedMessage },
      "Bot message generated successfully"
    );
  } catch (error) {
    return createErrorResponse(
      `Failed to generate bot response: ${error}`,
      500
    );
  }
});

