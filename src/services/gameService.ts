import { supabase } from '../core/supabase';
import { gameLogger } from '../utils/logger';

export const gameService = {
  async createGame(): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('games')
        .insert({ status: 'waiting' })
        .select()
        .single();
      
      if (error) {
        gameLogger.error('Failed to create game:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      gameLogger.error('Create game error:', error);
      throw error;
    }
  },

  async joinGame(gameId: number, userId: number): Promise<any> {
    const { data, error } = await supabase
      .from('game_players')
      .insert({ 
        game_id: gameId, 
        user_id: userId, 
        is_bot: false 
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getGame(gameId: number): Promise<any> {
    const { data, error } = await supabase
      .from('games')
      .select(`
        *,
        players:game_players(
          *,
          user:users(*)
        ),
        messages(*)
      `)
      .eq('id', gameId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async subscribeToGame(gameId: number, callback: (game: any) => void) {
    return supabase
      .channel(`game:${gameId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'games', filter: `id=eq.${gameId}` },
        callback
      )
      .subscribe();
  },

  async subscribeToMessages(gameId: number, callback: (message: any) => void) {
    return supabase
      .channel(`messages:${gameId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `game_id=eq.${gameId}` },
        (payload) => callback(payload.new)
      )
      .subscribe();
  }
};
