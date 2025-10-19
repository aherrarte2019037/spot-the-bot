import { ExpoConfig } from 'expo/config';

export interface ExtraConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export interface CustomExpoConfig extends ExpoConfig {
  extra: ExtraConfig;
}
