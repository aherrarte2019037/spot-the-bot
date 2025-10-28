import { supabase } from '../core/supabase';
import { Message, MessageWithPlayer } from '../types';

export interface SendMessageData {
  game_id: number;
  player_id: number;
  content: string;
}

export const messageService = {
  async send(sendMessageData: SendMessageData): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        ...sendMessageData,
        is_bot: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getByGameId(gameId: number): Promise<MessageWithPlayer[]> {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        player:game_players(*)
      `)
      .eq('game_id', gameId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return data
  }
};
