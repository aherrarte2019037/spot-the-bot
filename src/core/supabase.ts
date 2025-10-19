import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { ExtraConfig } from '../types';

const extra = Constants.expoConfig?.extra as ExtraConfig;

if (!extra.supabaseUrl || !extra.supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabaseUrl = extra.supabaseUrl;
const supabaseAnonKey = extra.supabaseAnonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
