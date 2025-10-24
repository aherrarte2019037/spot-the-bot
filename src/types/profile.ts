export interface Profile {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
  onboardingCompleted: boolean;
}

export const EmptyProfile: Profile = {
  id: '',
  username: '',
  email: '',
  avatarUrl: '',
  onboardingCompleted: false,
};
