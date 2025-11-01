import { GamePlayerWithProfile } from '../types';

export function getPlayerName(player: GamePlayerWithProfile): string {
  if (player.is_bot && player.bot_username) {
    return player.bot_username;
  }

  if (player.profile?.user_name) {
    return player.profile.user_name;
  }

  return "Unknown";
}

