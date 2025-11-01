import { supabase } from '../core/supabase';
import { Vote } from '../types';
import { gameLogger } from '../utils';

export interface SubmitVotesData {
  game_id: number;
  voter_id: number;
  target_ids: number[];
}

export const voteService = {
  async submitVotes(submitVotesData: SubmitVotesData): Promise<Vote[]> {
    const { data: response, error } = await supabase.functions.invoke('submit-votes', {
      body: submitVotesData,
    });

    if (error || !response.success) {
      gameLogger.error('Failed to submit votes:', error);
      throw new Error(error.message || response.message || 'Failed to submit votes');
    }

    return response.data.votes;
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
