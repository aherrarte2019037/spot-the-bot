import {
  createErrorResponse,
  createSuccessResponse,
  createSupabaseClient,
} from "../_shared/utils.ts";
import { AIService } from "../_shared/aiService.ts";
import type { TablesInsert } from "../_shared/database.types.ts";

const BotTimingConfig = {
  CheckInterval: 10,
  MinGapBetweenMessages: 20,
  ProbFirstMessage: 0.4,
  ProbOverdue40s: 0.9,
  ProbGood30s: 0.6,
  ProbMaybe20s: 0.3,
};

interface BotAction {
  game_id: number;
  bot_id: number;
  bot_name: string | null;
  seconds_since_last: number | null;
  probability: number;
  message_preview?: string;
}

function calculateResponseProbability(secondsSinceLastMessage: number | null): number {
  if (secondsSinceLastMessage === null) {
    return BotTimingConfig.ProbFirstMessage;
  }
  if (secondsSinceLastMessage >= 40) {
    return BotTimingConfig.ProbOverdue40s;
  }
  if (secondsSinceLastMessage >= 30) {
    return BotTimingConfig.ProbGood30s;
  }
  if (secondsSinceLastMessage >= BotTimingConfig.MinGapBetweenMessages) {
    return BotTimingConfig.ProbMaybe20s;
  }
  return 0;
}

Deno.serve(async () => {
  try {
    const supabase = createSupabaseClient();
    const startTime = Date.now();

    const { data: activeGames, error: gamesError } = await supabase
      .from("games")
      .select("id, topic, status, created_at")
      .eq("status", "chatting");

    if (gamesError) {
      return createErrorResponse(
        `Failed to fetch active games: ${gamesError.message}`,
        500
      );
    }

    if (!activeGames || activeGames.length === 0) {
      return createSuccessResponse(
        {
          processed_games: 0,
          triggered_responses: 0,
          actions: [],
          execution_time_ms: Date.now() - startTime,
        },
        "No active games found"
      );
    }

    let aiService: AIService;
    try {
      aiService = new AIService();
    } catch (error) {
      return createErrorResponse(
        `AI service configuration error: ${error}`,
        500
      );
    }

    const triggeredActions: BotAction[] = [];
    const errors: string[] = [];

    for (const game of activeGames) {
      const { data: botPlayers, error: botsError } = await supabase
        .from("game_players")
        .select("id, bot_username, is_bot, bot_personality")
        .eq("game_id", game.id)
        .eq("is_bot", true);

      if (botsError || !botPlayers || botPlayers.length === 0) {
        continue;
      }

      for (const bot of botPlayers) {
        const { data: lastMessage } = await supabase
          .from("messages")
          .select("created_at")
          .eq("game_id", game.id)
          .eq("player_id", bot.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const secondsSinceLastMessage = lastMessage
          ? Math.floor((Date.now() - new Date(lastMessage.created_at).getTime()) / 1000)
          : null;

        if (secondsSinceLastMessage !== null && secondsSinceLastMessage < BotTimingConfig.MinGapBetweenMessages) {
          continue;
        }

        const probability = calculateResponseProbability(secondsSinceLastMessage);
        const shouldRespond = Math.random() < probability;

        if (shouldRespond && probability > 0) {
          try {
            const { data: messages } = await supabase
              .from("messages")
              .select(`
                *,
                player:game_players(
                  *,
                  profile:profiles(user_name, email, avatar_url)
                )
              `)
              .eq("game_id", game.id)
              .order("created_at", { ascending: false })
              .limit(20);

            const conversationHistory = (messages || []).map((msg) => ({
              player: msg.player,
              message: msg.content,
            }));

            const botMessage = await aiService.generateMessage({
              personality: bot.bot_personality,
              topic: game.topic,
              conversationHistory,
            });

            const messageToInsert: TablesInsert<"messages"> = {
              game_id: game.id,
              player_id: bot.id,
              content: botMessage,
              is_bot: true,
            };

            const { error: insertError } = await supabase
              .from("messages")
              .insert(messageToInsert);

            if (insertError) {
              errors.push(
                `Bot ${bot.id} in game ${game.id}: ${insertError.message}`
              );
            } else {
              triggeredActions.push({
                game_id: game.id,
                bot_id: bot.id,
                bot_name: bot.bot_username,
                seconds_since_last: secondsSinceLastMessage,
                probability,
                message_preview: botMessage.substring(0, 50),
              });
            }
          } catch (error) {
            errors.push(
              `Bot ${bot.id} in game ${game.id}: ${error}`
            );
          }
        }
      }
    }

    const executionTime = Date.now() - startTime;

    return createSuccessResponse(
      {
        processed_games: activeGames.length,
        triggered_responses: triggeredActions.length,
        actions: triggeredActions,
        errors: errors.join(", "),
        execution_time_ms: executionTime,
      });
  } catch (error) {
    return createErrorResponse(`Monitor function error: ${error}`, 500);
  }
});
