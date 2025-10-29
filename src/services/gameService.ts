import { supabase } from '../core/supabase';
import { gameLogger } from '../utils/logger';
import { GameWithPlayers, TablesInsert, GamePlayer, Message, Game, MessageWithPlayer } from '../types';
import { RealtimeChannel } from '@supabase/supabase-js';

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
        messages(*, player:game_players(*, profile:profiles(user_name, email, avatar_url)))
      `)
      .eq('id', gameId)
      .single();

    if (error) throw error;

    return {
      ...data,
      messages: data.messages.map(m => ({ ...m, player: m.player }))
    };
  },

  subscribeToGame(gameId: number, callback: (game: Game) => void): RealtimeChannel {
    return supabase
      .channel(`game:${gameId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'games', filter: `id=eq.${gameId}` },
        (payload) => callback(payload.new as Game)
      )
      .subscribe();
  },

  async subscribeToMessages(gameId: number, callback: (message: MessageWithPlayer) => void): Promise<RealtimeChannel> {
    const channel = supabase
      .channel(`messages:${gameId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `game_id=eq.${gameId}` },
        async (payload) => {
          const message = payload.new as Message;

          const { data: playerData, error } = await supabase
            .from('game_players')
            .select(`* ,profile:profiles(user_name, email, avatar_url)`)
            .eq('id', message.player_id)
            .single();

          if (error) {
            gameLogger.error('Failed to fetch player for message:', error);
            throw error;
          }

          callback({ ...message, player: playerData });
        }
      )
      .subscribe();

    return channel;
  }
};
