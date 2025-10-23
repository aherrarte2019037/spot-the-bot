import { supabase } from '../core/supabase';
import { GoogleSignin, isSuccessResponse } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';
import { authLogger } from '../utils/logger';
import { PlatformType } from '../types';
import { oauthConfig } from '../core';

GoogleSignin.configure({
  webClientId: oauthConfig.googleWebClientId,
  iosClientId: oauthConfig.googleIOSClientId,
});

export const authService = {
  // Google Sign-In (Android + iOS)
  async signInWithGoogle() {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      if (!isSuccessResponse(userInfo)) {
        authLogger.error('Google sign-in failed:', userInfo);
        throw new Error('Google sign-in failed');
      }

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: userInfo.data!.idToken!,
      });

      if (error) {
        authLogger.error('Supabase Google auth failed:', error);
        throw error;
      }

      return data;
    } catch (error) {
      authLogger.error('Google sign-in failed:', error);
      throw error;
    }
  },

  // Apple Sign-In (iOS only)
  async signInWithApple() {
    if (Platform.OS !== PlatformType.IOS) {
      authLogger.warn('Apple Sign-In attempted on non-iOS platform');
      throw new Error('Apple Sign-In is only available on iOS');
    }

    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken!,
      });

      if (error) {
        authLogger.error('Supabase Apple auth failed:', error);
        throw error;
      }

      return data;
    } catch (error) {
      authLogger.error('Apple sign-in failed:', error);
      throw error;
    }
  },

  // Email/Password Sign Up
  async signUpWithEmail(email: string, password: string, username: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username }
        }
      });

      if (error) {
        authLogger.error('Email sign-up failed:', error);
        throw error;
      }

      return data;
    } catch (error) {
      authLogger.error('Email sign-up error:', error);
      throw error;
    }
  },

  // Email/Password Sign In
  async signInWithEmail(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        authLogger.error('Email sign-in failed:', error);
        throw error;
      }

      return data;
    } catch (error) {
      authLogger.error('Email sign-in error:', error);
      throw error;
    }
  },

  async signOut() {
    try {
      try {
        await GoogleSignin.signOut();
      } catch (error) {
        authLogger.info('Google sign-out skipped (not signed in with Google)');
      }

      const { error } = await supabase.auth.signOut();
      if (error) {
        authLogger.error('Supabase sign-out failed:', error);
        throw error;
      }
    } catch (error) {
      authLogger.error('Sign-out error:', error);
      throw error;
    }
  },

  getCurrentUser() {
    return supabase.auth.getUser();
  },

  isAppleSignInAvailable() {
    return Platform.OS === PlatformType.IOS && AppleAuthentication.isAvailableAsync();
  }
};
