import { supabase } from '../core/supabase';
import { gameService } from './gameService';
import { topicService } from './topicService';
import { GameWithPlayers, TablesInsert } from '../types';
import { authLogger } from '../utils/logger';
import { formatISO, subSeconds } from 'date-fns';

export const matchmakingService = {
  async startMatchmaking(profileId: string): Promise<GameWithPlayers> {
    try {
      authLogger.info('Starting matchmaking for profile:', profileId);

      const existingGame = await this.findWaitingGame();

      if (existingGame && !this.isGameFull(existingGame)) {
        authLogger.info('Found existing game, joining:', existingGame.id);
        await gameService.join(existingGame.id, profileId);
        const updatedGame = await gameService.get(existingGame.id);
        return updatedGame;
      }

      authLogger.info('Creating new game');
      const game = await this.createNewGame(profileId);

      return game;
    } catch (error) {
      authLogger.error('Matchmaking error:', error);
      throw error;
    }
  },

  async findWaitingGame(): Promise<GameWithPlayers | null> {
    try {
      const thirtySecondsAgo = formatISO(subSeconds(new Date(), 30));

      const { data, error } = await supabase
        .from('games')
        .select(`
          *,
          players:game_players(
            *,
            profile:profiles(id, user_name, email, avatar_url)
          )
        `)
        .eq('status', 'waiting')
        .gte('created_at', thirtySecondsAgo)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) {
        authLogger.error('Error finding game:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      return { ...data, messages: [] };

    } catch (error) {
      authLogger.error('Error in findWaitingGame:', error);
      return null;
    }
  },

  isGameFull(game: GameWithPlayers): boolean {
    return game.players.length >= (game.max_players || 7);
  },

  async createNewGame(profileId: string): Promise<GameWithPlayers> {
    try {
      const topic = await topicService.getRandom();

      const gameInsert: TablesInsert<'games'> = {
        status: 'waiting',
        topic: topic.topic,
        topic_id: topic.id,
        max_players: 7,
        bot_count: 2,
        chat_duration: 120,
      };

      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .insert(gameInsert)
        .select()
        .single();

      if (gameError) {
        authLogger.error('Error creating game:', gameError);
        throw gameError;
      }

      await this.addBotsToGame(gameData.id, 2);

      await gameService.join(gameData.id, profileId);
      const game = await gameService.get(gameData.id);

      return game;
    } catch (error) {
      authLogger.error('Error in createNewGame:', error);
      throw error;
    }
  },

  async addBotsToGame(gameId: number, count: number): Promise<void> {
    const { data: response, error } = await supabase.functions.invoke('add-bots', {
      body: { game_id: gameId, count },
    });

    if (error || !response.success) {
      authLogger.error('Failed to add bots:', error);
      throw new Error(error.message);
    }
  },

  subscribeToGameUpdates(gameId: number, callback: (game: GameWithPlayers) => void) {
    return supabase
      .channel(`game:${gameId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'games', filter: `id=eq.${gameId}` },
        async () => {
          const game = await gameService.get(gameId);
          callback(game);
        }
      )
      .subscribe();
  },
};

