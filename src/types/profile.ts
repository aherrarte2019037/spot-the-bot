export interface Profile {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
  onboardingComplete: boolean;
  xp: number;
  level: number;
  gamesPlayed: number;
  gamesWon: number;
}

export interface GameProfile {
  username: string;
  email: string;
  avatarUrl: string;
}

export const EmptyProfile: Profile = {
  id: '',
  username: '',
  email: '',
  avatarUrl: '',
  onboardingComplete: false,
  xp: 0,
  level: 1,
  gamesPlayed: 0,
  gamesWon: 0,
};
