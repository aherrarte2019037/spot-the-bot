import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import type { Database } from "./database.types.ts";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

interface ErrorResponse {
  success: false;
  data: null;
  message: string;
}

interface SuccessResponse<T> {
  success: true;
  data: T;
  message: string;
}

export function createErrorResponse(
  message: string,
  status: number = 500
): Response {
  const body: ErrorResponse = {
    success: false,
    data: null,
    message,
  };
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

export function createSuccessResponse<T>(
  data: T,
  message: string = "Success"
): Response {
  const body: SuccessResponse<T> = {
    success: true,
    data,
    message,
  };
  return new Response(JSON.stringify(body), { status: 200, headers: corsHeaders });
}

export function createSupabaseClient(): ReturnType<typeof createClient<Database>> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient<Database>(supabaseUrl, supabaseKey);
}

export function requireAuth(req: Request): Response | null {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return createErrorResponse("Missing authorization header", 401);
  }
  return null;
}

