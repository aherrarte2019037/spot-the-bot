import { GameProfile } from "./profile";

export interface Game {
  id: number;
  status: GameStatus;
  topic: string;
  topicId: number | null;
  maxPlayers: number;
  botCount: number;
  botPlayerIds: string[];
  createdAt: string;
  updatedAt: string;
  startedAt: string | null;
  endedAt: string | null;
  chatDuration: number;
  players: GamePlayer[];
  messages: Message[];
}

export type GameStatus = 'waiting' | 'chatting' | 'voting' | 'completed';

export interface GamePlayer {
  id: number;
  gameId: number;
  profileId: string | null;
  profile: GameProfile | null;
  isBot: boolean;
  botPersonality: BotPersonality | null;
  score: number;
  createdAt: string;
}

export type BotPersonality = 'casual' | 'formal' | 'quirky';

export interface Message {
  id: number;
  gameId: number;
  playerId: number;
  player: GamePlayer | null;
  content: string;
  isBot: boolean;
  createdAt: string;
}

export interface Vote {
  id: number;
  gameId: number;
  voterId: number;
  targetId: number;
  createdAt: string;
}

export interface Topic {
  id: number;
  topic: string;
  category: string;
  createdAt: string;
}
