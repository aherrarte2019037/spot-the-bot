import { supabase } from '../core/supabase';
import { Topic } from '../types';
import { TopicCategory } from '../types/game';

export const topicService = {
  async getRandom(): Promise<Topic> {
    const { data, error } = await supabase
      .rpc('get_random_topic')
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

  async getByCategory(category: TopicCategory): Promise<Topic[]> {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }
};
