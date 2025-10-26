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
        onboardingComplete: data.onboarding_complete,
        xp: data.xp,
        level: data.level,
        gamesPlayed: data.games_played,
        gamesWon: data.games_won,
      };
    } catch (error) {
      authLogger.error('Error in getProfile:', error);
      return null;
    }
  },

  async update(profileId: string, updates: Partial<Omit<Profile, 'id'>>): Promise<boolean> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (updates.username !== undefined) updateData.user_name = updates.username;
      if (updates.email !== undefined) updateData.email = updates.email;
      if (updates.avatarUrl !== undefined) updateData.avatar_url = updates.avatarUrl;
      if (updates.onboardingComplete !== undefined) updateData.onboarding_complete = updates.onboardingComplete;
      if (updates.xp !== undefined) updateData.xp = updates.xp;
      if (updates.level !== undefined) updateData.level = updates.level;
      if (updates.gamesPlayed !== undefined) updateData.games_played = updates.gamesPlayed;
      if (updates.gamesWon !== undefined) updateData.games_won = updates.gamesWon;

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
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
          onboarding_complete: profileData.onboardingComplete,
          xp: profileData.xp,
          level: profileData.level,
          games_played: profileData.gamesPlayed,
          games_won: profileData.gamesWon,
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
