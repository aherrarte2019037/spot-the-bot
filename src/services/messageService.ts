import { supabase } from '../core/supabase';

export const messageService = {
  async sendMessage(gameId: number, playerId: number, content: string): Promise<any> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        game_id: gameId,
        player_id: playerId,
        content,
        is_bot: false
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getMessages(gameId: number): Promise<any[]> {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        player:game_players(
          *,
          user:users(*)
        )
      `)
      .eq('game_id', gameId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  }
};
