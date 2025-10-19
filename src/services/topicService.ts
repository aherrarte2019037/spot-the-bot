import { supabase } from '../core/supabase';

export const topicService = {
  async getRandomTopic(): Promise<any> {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .order('random()')
      .limit(1)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getAllTopics(): Promise<any[]> {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getTopicsByCategory(category: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  }
};
