import { supabase } from '../core/supabase';
import { Topic } from '../types';

export const topicService = {
  async getRandom(): Promise<Topic> {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .order('random()')
      .limit(1)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getAll(): Promise<Topic[]> {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getByCategory(category: string): Promise<Topic[]> {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  }
};
