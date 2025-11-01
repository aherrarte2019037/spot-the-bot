import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import type { Database, TablesInsert } from "../_shared/database.types.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

const ADJECTIVES = [
  'swift', 'clever', 'bold', 'sharp', 'nimble', 'bright', 'quick', 'wise',
  'smart', 'keen', 'fresh', 'cool', 'epic', 'mega', 'super', 'ultra'
];

const NOUNS = [
  'bot', 'ai', 'nexus', 'core', 'node', 'unit', 'byte', 'pixel',
  'vector', 'matrix', 'logic', 'pulse', 'spark', 'echo', 'beam', 'dash'
];

function generateBotName(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adj}${noun}`;
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

    const { game_id, count }: { game_id: number; count: number } = await req.json();

    if (!game_id || !count || count < 1) {
      return new Response(
        JSON.stringify({ success: false, data: null, message: "Missing required fields: game_id, count" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate game exists
    const { data: game, error: gameError } = await supabase
      .from("games")
      .select("id")
      .eq("id", game_id)
      .single();

    if (gameError || !game) {
      return new Response(
        JSON.stringify({ success: false, data: null, message: "Game not found" }),
        { status: 404, headers: corsHeaders }
      );
    }

    const personalities: Database["public"]["Enums"]["bot_personality"][] = ['casual', 'formal', 'quirky'];
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
      return new Response(
        JSON.stringify({ success: false, data: null, message: `Failed to add bots: ${insertError.message}` }),
        { status: 500, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: { bots: insertedBots }, message: `Successfully added ${count} bot(s)` }),
      { status: 200, headers: corsHeaders }
    );
  } catch {
    return new Response(
      JSON.stringify({ success: false, data: null, message: "Failed to add bots" }),
      { status: 500, headers: corsHeaders }
    );
  }
});

