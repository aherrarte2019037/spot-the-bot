import { Enums, Tables } from './database.types';
import { GameProfile } from './profile';

export type Game = Tables<'games'>;
export type GamePlayer = Tables<'game_players'>;
export type Message = Tables<'messages'>;
export type Vote = Tables<'votes'>;
export type Topic = Tables<'topics'>;

export type GameStatus = Enums<'game_status'>;
export type BotPersonality = Enums<'bot_personality'>;
export type MatchmakingStatus = "searching" | "found" | "starting";
export type TopicCategory = Enums<'topic_category'>;

export type GameWithPlayers = Game & {
  players: GamePlayerWithProfile[];
  messages: MessageWithPlayer[];
};

export type GamePlayerWithProfile = GamePlayer & {
  profile: GameProfile | null;
};

export type MessageWithPlayer = Message & {
  player: GamePlayerWithProfile;
};

export type VoteWithRelations = Vote & {
  voter: GamePlayer;
  target: GamePlayer;
};

export type GameResults = {
  botPlayers: string[];
  currentPlayerCorrectVotes: number;
  currentPlayerTotalVotes: number;
  currentPlayerScore: number;
  xpGained: number;
  totalCorrectPlayers: number;
};