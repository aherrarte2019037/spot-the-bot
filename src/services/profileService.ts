import { supabase } from '../core/supabase';
import { Profile, TablesInsert, TablesUpdate } from '../types';
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

      return data;
    } catch (error) {
      authLogger.error('Error in getProfile:', error);
      return null;
    }
  },

  async update(profileId: string, updates: TablesUpdate<'profiles'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
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

  async create(profileId: string, profileData: Omit<TablesInsert<'profiles'>, 'id'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          ...profileData,
          id: profileId,
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
