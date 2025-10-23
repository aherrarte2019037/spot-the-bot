import React, { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import * as SplashScreen from 'expo-splash-screen';
import { supabase } from '../core/supabase';
import { AuthContext, AuthData } from '../contexts/AuthContext';
import { User, EmptyUser } from '../types';
import { authLogger } from '../utils/logger';
import { mapSupabaseUserToUser } from '../utils/userMapper';
import { profileService } from '../services/profileService';

SplashScreen.preventAutoHideAsync();

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User>(EmptyUser);
  const [isLoading, setIsLoading] = useState(true);

  // Load user profile from database
  const loadUserProfile = async (userId: string): Promise<User> => {
    try {
      // First try to get from profiles table
      const profileUser = await profileService.getProfile(userId);
      if (profileUser) {
        return profileUser;
      }

      throw new Error('User profile not found');
    } catch (error) {
      authLogger.error('Error loading user profile:', error);
      return EmptyUser;
    }
  };

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          authLogger.error('Error getting initial session:', error);
        } else {
          setSession(session);
          if (session && session.user) {
            const userProfile = await loadUserProfile(session.user.id);
            setUser(userProfile);
          } else {
            setUser(EmptyUser);
          }
        }
      } catch (error) {
        authLogger.error('Error in getInitialSession:', error);
      } finally {
        setIsLoading(false);
        await SplashScreen.hideAsync();
      }
    };

    getInitialSession();

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          authLogger.info('Auth state changed:', { event, hasSession: !!session });
          
          setSession(session);
          if (session?.user) {
            const userProfile = await loadUserProfile(session.user.id);
            setUser(userProfile);
          } else {
            setUser(EmptyUser);
          }
          setIsLoading(false);
        }
      );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const authData: AuthData = {
    session,
    user,
    isLoading,
    isLoggedIn: !!session && !!user,
  };

  return (
    <AuthContext.Provider value={authData}>
      {children}
    </AuthContext.Provider>
  );
}
