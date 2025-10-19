import { supabase } from '../core/supabase';

export const voteService = {
  async submitVote(gameId: number, voterId: number, targetId: number): Promise<any> {
    const { data, error } = await supabase
      .from('votes')
      .insert({
        game_id: gameId,
        voter_id: voterId,
        target_id: targetId
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getVotes(gameId: number): Promise<any[]> {
    const { data, error } = await supabase
      .from('votes')
      .select('*')
      .eq('game_id', gameId);
    
    if (error) throw error;
    return data;
  }
};
