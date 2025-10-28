import { supabase } from '../core/supabase';
import { Vote } from '../types';

export interface SubmitVoteData {
  game_id: number;
  voter_id: number;
  target_id: number;
}

export const voteService = {
  async submit(submitVoteData: SubmitVoteData): Promise<Vote> {
    const { data, error } = await supabase
      .from('votes')
      .insert(submitVoteData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getByGameId(gameId: number): Promise<Vote[]> {
    const { data, error } = await supabase
      .from('votes')
      .select('*')
      .eq('game_id', gameId);
    
    if (error) throw error;
    return data;
  }
};
