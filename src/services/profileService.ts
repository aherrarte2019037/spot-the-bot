import { supabase } from '../core/supabase';
import { User } from '../types';
import { authLogger } from '../utils/logger';

export const profileService = {
  // Get user profile from public.profiles table
  async getProfile(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        authLogger.error('Error fetching profile:', error);
        return null;
      }

      return {
        id: data.id,
        username: data.user_name,
        email: data.email,
        avatarUrl: data.avatar_url,
      };
    } catch (error) {
      authLogger.error('Error in getProfile:', error);
      return null;
    }
  },

  // Update user profile
  async updateProfile(userId: string, updates: Partial<Omit<User, 'id'>>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          user_name: updates.username,
          email: updates.email,
          avatar_url: updates.avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        authLogger.error('Error updating profile:', error);
        return false;
      }

      return true;
    } catch (error) {
      authLogger.error('Error in updateProfile:', error);
      return false;
    }
  },

  // Create profile (usually called by trigger, but can be used manually)
  async createProfile(userId: string, userData: Omit<User, 'id'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          user_name: userData.username,
          email: userData.email,
          avatar_url: userData.avatarUrl,
        });

      if (error) {
        authLogger.error('Error creating profile:', error);
        return false;
      }

      return true;
    } catch (error) {
      authLogger.error('Error in createProfile:', error);
      return false;
    }
  },

  // Delete profile (usually handled by cascade delete from auth.users)
  async deleteProfile(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        authLogger.error('Error deleting profile:', error);
        return false;
      }

      return true;
    } catch (error) {
      authLogger.error('Error in deleteProfile:', error);
      return false;
    }
  },
};
