import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from './config';
import * as SecureStore from 'expo-secure-store';
import 'react-native-url-polyfill/auto';
import { Database } from '../types/database.types';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    return SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient<Database>(
  supabaseConfig.url,
  supabaseConfig.key,
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
