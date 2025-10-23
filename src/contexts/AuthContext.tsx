import { Session } from '@supabase/supabase-js';
import { createContext, useContext } from 'react';
import { User, EmptyUser } from '../types';

export type AuthData = {
  session: Session | null;
  user: User;
  isLoading: boolean;
  isLoggedIn: boolean;
  refreshUser: () => Promise<void>;
};

export const AuthContext = createContext<AuthData>({
  session: null,
  user: EmptyUser,
  isLoading: true,
  isLoggedIn: false,
  refreshUser: async () => {},
});

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
