import Constants from "expo-constants";
import { ExtraConfig, OAuthConfig, SupabaseConfig } from "../types";

const config = Constants.expoConfig?.extra as ExtraConfig

if (!config.supabaseUrl || !config.supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

if (!config.googleWebClientId) {
  throw new Error('Missing Google Web Client ID');
}

if (!config.googleIOSClientId) {
  throw new Error('Missing Google iOS Client ID');
}

export const supabaseConfig: SupabaseConfig = {
  url: config.supabaseUrl,
  key: config.supabaseAnonKey,
}

export const oauthConfig: OAuthConfig = {
  googleWebClientId: config.googleWebClientId,
  googleIOSClientId: config.googleIOSClientId,
}