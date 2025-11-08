import { serve } from "deno";
import type { TablesInsert } from "../_shared/database.types.ts";
import { createErrorResponse, createSuccessResponse, createSupabaseClient, requireAuth } from "../_shared/utils.ts";
import type { BotPersonality } from "../_shared/schemas.ts";

const ADJECTIVES = [
  'swift', 'clever', 'bold', 'sharp', 'nimble', 'bright', 'quick', 'wise',
  'smart', 'keen', 'fresh', 'cool', 'epic', 'mega', 'super', 'ultra'
];

const NOUNS = [
  'bot', 'ai', 'nexus', 'core', 'node', 'unit', 'byte', 'pixel',
  'vector', 'matrix', 'logic', 'pulse', 'spark', 'echo', 'beam', 'dash'
];

interface AddBotsRequest {
  game_id: number;
  count: number;
}

function generateBotName(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adj}${noun}`;
}

serve(async (req) => {
  try {
    const authError = requireAuth(req);
    if (authError) return authError;

    const supabase = createSupabaseClient();

    const { game_id, count }: AddBotsRequest = await req.json();

    if (!game_id || !count || count < 1) {
      return createErrorResponse("Missing required fields: game_id, count", 400);
    }

    // Validate game exists
    const { data: game, error: gameError } = await supabase
      .from("games")
      .select("id")
      .eq("id", game_id)
      .single();

    if (gameError || !game) {
      return createErrorResponse("Game not found", 404);
    }

    const personalities: BotPersonality[] = ['casual', 'formal', 'quirky'];
    const bots: TablesInsert<"game_players">[] = [];

    for (let i = 0; i < count; i++) {
      const botName = generateBotName();

      bots.push({
        game_id,
        profile_id: null,
        is_bot: true,
        bot_personality: personalities[i % personalities.length],
        bot_username: botName,
        score: 0,
      });
    }

    const { data: insertedBots, error: insertError } = await supabase
      .from("game_players")
      .insert(bots)
      .select();

    if (insertError) {
      return createErrorResponse(`Failed to add bots: ${insertError.message}`, 500);
    }

    return createSuccessResponse({ bots: insertedBots }, `Successfully added ${count} bot(s)`);
  } catch {
    return createErrorResponse("Failed to add bots", 500);
  }
});

