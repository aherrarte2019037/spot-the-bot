import { supabase } from '../core/supabase';
import { gameLogger } from '../utils/logger';
import { GameWithPlayers, TablesInsert, GamePlayer } from '../types';

export const gameService = {
  async create(gameData: TablesInsert<'games'>): Promise<GameWithPlayers> {
    try {
      const { data, error } = await supabase
        .from('games')
        .insert({ ...gameData })
        .select()
        .single();

      if (error) {
        gameLogger.error('Failed to create game:', error);
        throw error;
      }

      return {
        ...data,
        players: [],
        messages: [],
      };
    } catch (error) {
      gameLogger.error('Create game error:', error);
      throw error;
    }
  },

  async join(gameId: number, profileId: string): Promise<GamePlayer> {
    const { data, error } = await supabase
      .from('game_players')
      .insert({
        game_id: gameId,
        profile_id: profileId,
        is_bot: false
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async get(gameId: number): Promise<GameWithPlayers> {
    const { data, error } = await supabase
      .from('games')
      .select(`
        *,
        players:game_players(
          *,
          profile:profiles(user_name, email, avatar_url)
        ),
        messages(*)
      `)
      .eq('id', gameId)
      .single();

    if (error) throw error;

    return {
      ...data,
      messages: data.messages.map(m => ({ ...m, player: null }))
    };
  },

  async subscribeTo(gameId: number, callback: (game: any) => void) {
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
