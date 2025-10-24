import { Session } from '@supabase/supabase-js';
import { createContext, useContext } from 'react';
import { Profile, EmptyProfile } from '../types';

export type AuthData = {
  session: Session | null;
  profile: Profile;
  isLoading: boolean;
  isLoggedIn: boolean;
  refreshProfile: () => Promise<void>;
};

export const AuthContext = createContext<AuthData>({
  session: null,
  profile: EmptyProfile,
  isLoading: true,
  isLoggedIn: false,
  refreshProfile: async () => {},
});

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
