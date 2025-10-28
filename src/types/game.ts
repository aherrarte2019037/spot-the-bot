import { Tables } from './database.types';
import { GameProfile } from './profile';

export type Game = Tables<'games'>;
export type GamePlayer = Tables<'game_players'>;
export type Message = Tables<'messages'>;
export type Vote = Tables<'votes'>;
export type Topic = Tables<'topics'>;

export type GameStatus = 'waiting' | 'chatting' | 'voting' | 'completed';
export type BotPersonality = 'casual' | 'formal' | 'quirky';

export type GameWithPlayers = Game & {
  players: GamePlayerWithProfile[];
  messages: MessageWithPlayer[];
};

export type GamePlayerWithProfile = GamePlayer & {
  profile: GameProfile | null;
};

export type MessageWithPlayer = Message & {
  player: GamePlayer | null;
};

export type VoteWithRelations = Vote & {
  voter: GamePlayer;
  target: GamePlayer;
};