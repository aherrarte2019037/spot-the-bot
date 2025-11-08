import * as z from "zod";
import { Enums, Tables } from './database.types.ts';

export const BotMessageSchema = z.object({
  message: z.string().describe("The bot's response message to the conversation"),
});

export type Game = Tables<'games'>;
export type GamePlayer = Tables<'game_players'>;
export type Message = Tables<'messages'>;
export type Vote = Tables<'votes'>;
export type Topic = Tables<'topics'>;
export type GameResultsView = Tables<'game_results_view'>
export type GameBotPlayersView = Tables<'game_bot_players_view'>;

export type GameStatus = Enums<'game_status'>;
export type BotPersonality = Enums<'bot_personality'>;
export type MatchmakingStatus = "searching" | "found" | "starting";
export type TopicCategory = Enums<'topic_category'>;

export type GameProfile = {
  user_name: string;
  email: string;
  avatar_url: string;
};

export type GamePlayerWithProfile = GamePlayer & {
  profile: GameProfile | null;
};

export type MessageWithPlayer = Message & {
  player: GamePlayerWithProfile;
};

export type BotMessage = z.infer<typeof BotMessageSchema>;


