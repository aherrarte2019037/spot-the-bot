import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from './config';
import 'react-native-url-polyfill/auto';
import { Database } from '../types/database.types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ExpoWebSecureStoreAdapter = {
  getItem: (key: string) => {
    console.debug("getItem", { key })
    return AsyncStorage.getItem(key)
  },
  setItem: (key: string, value: string) => {
    return AsyncStorage.setItem(key, value)
  },
  removeItem: (key: string) => {
    return AsyncStorage.removeItem(key)
  },
};

export const supabase = createClient<Database>(
  supabaseConfig.url,
  supabaseConfig.key,
  {
    auth: {
      storage: ExpoWebSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
