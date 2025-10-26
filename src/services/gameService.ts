import { supabase } from '../core/supabase';
import { gameLogger } from '../utils/logger';
import { Game, GamePlayer, Message } from '../types';

export const gameService = {
  async createGame(gameData: {
    status: string;
    topic?: string;
    topicId?: number;
    maxPlayers?: number;
    botCount?: number;
    chatDuration?: number;
  }): Promise<any> {
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
      
      return data;
    } catch (error) {
      gameLogger.error('Create game error:', error);
      throw error;
    }
  },

  async joinGame(gameId: number, profileId: string): Promise<any> {
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

  async getGame(gameId: number): Promise<Game> {
    const { data, error } = await supabase
      .from('games')
      .select(`
        *,
        players:game_players(
          *,
          profile:profiles(id, user_name, email, avatar_url)
        ),
        messages(*)
      `)
      .eq('id', gameId)
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      status: data.status,
      topic: data.topic || '',
      topicId: data.topic_id,
      maxPlayers: data.max_players || 7,
      botCount: data.bot_count || 2,
      botPlayerIds: data.bot_player_ids || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      startedAt: data.started_at,
      endedAt: data.ended_at,
      chatDuration: data.chat_duration || 120,
      players: (data.players || []).map((p: any) => ({
        id: p.id,
        gameId: p.game_id,
        profileId: p.profile_id,
        profile: p.profile ? {
          username: p.profile.user_name,
          email: p.profile.email,
          avatarUrl: p.profile.avatar_url,
        } : null,
        isBot: p.is_bot,
        botPersonality: p.bot_personality,
        score: p.score || 0,
        createdAt: p.created_at,
      })),
      messages: (data.messages || []).map((m: any) => ({
        id: m.id,
        gameId: m.game_id,
        playerId: m.player_id,
        player: null, // TODO: join player data
        content: m.content,
        isBot: m.is_bot,
        createdAt: m.created_at,
      })),
    };
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
