import { supabase } from '../core/supabase';
import { Profile } from '../types';
import { authLogger } from '../utils/logger';

export const profileService = {
  async get(profileId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
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
        onboardingCompleted: data.onboarding_completed,
      };
    } catch (error) {
      authLogger.error('Error in getProfile:', error);
      return null;
    }
  },

  async update(profileId: string, updates: Partial<Omit<Profile, 'id'>>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          user_name: updates.username,
          email: updates.email,
          avatar_url: updates.avatarUrl,
          onboarding_completed: updates.onboardingCompleted,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profileId);

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

  async create(profileId: string, profileData: Omit<Profile, 'id'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: profileId,
          user_name: profileData.username,
          email: profileData.email,
          avatar_url: profileData.avatarUrl,
          onboarding_completed: profileData.onboardingCompleted,
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

  async delete(profileId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profileId);

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
