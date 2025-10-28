import { Tables } from './database.types';

export type Profile = Tables<'profiles'>;

export type GameProfile = {
  user_name: string;
  email: string;
  avatar_url: string;
};

export const EmptyProfile: Profile = {
  id: '',
  user_name: '',
  email: '',
  avatar_url: '',
  onboarding_complete: false,
  xp: 0,
  level: 1,
  games_played: 0,
  games_won: 0,
  created_at: '',
  updated_at: '',
};
