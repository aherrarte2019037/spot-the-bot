import { ExpoConfig } from 'expo/config';

export interface ExtraConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  googleWebClientId: string;
  eas: {
    projectId: string;
  }
}

export interface CustomExpoConfig extends ExpoConfig {
  extra: ExtraConfig;
}

export interface SupabaseConfig {
  url: string;
  key: string;
}

export interface OAuthConfig {
  googleWebClientId: string;
}