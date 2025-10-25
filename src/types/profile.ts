export interface Profile {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
  onboardingComplete: boolean;
}

export const EmptyProfile: Profile = {
  id: '',
  username: '',
  email: '',
  avatarUrl: '',
  onboardingComplete: false,
};
