import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import type { Database, TablesUpdate } from "../_shared/database.types.ts";

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

    const { game_id }: { game_id: number } = await req.json();

    if (!game_id) {
      return new Response(
        JSON.stringify({ success: false, data: null, message: "Missing game_id" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // 1. Validate game exists and is in chatting status
    const { data: game, error: gameError } = await supabase
      .from("games")
      .select("status, started_at")
      .eq("id", game_id)
      .single();

    if (gameError || !game) {
      return new Response(
        JSON.stringify({ success: false, data: null, message: "Game not found" }),
        { status: 404, headers: corsHeaders }
      );
    }

    const currentStatus = game.status;
    if (currentStatus !== "chatting") {
      return new Response(
        JSON.stringify({ success: false, data: null, message: `Game is not in chatting status (current: ${currentStatus})` }),
        { status: 400, headers: corsHeaders }
      );
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
      return new Response(
        JSON.stringify({ success: false, data: null, message: `Failed to end chat phase: ${updateError.message}` }),
        { status: 500, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: { game: updatedGame }, message: "Chat phase ended successfully" }),
      { status: 200, headers: corsHeaders }
    );
  } catch {
    return new Response(
      JSON.stringify({ success: false, data: null, message: "Failed to end chat phase" }),
      { status: 500, headers: corsHeaders }
    );
  }
});

