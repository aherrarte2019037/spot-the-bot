import type { StackScreenProps } from '@react-navigation/stack';

export enum NavigationRoutes {
  SignIn = 'SignIn',
  SignUp = 'SignUp',
  Onboarding = 'Onboarding',
  Home = 'Home',
  Matchmaking = 'Matchmaking',
  Game = 'Game',
  Results = 'Results',
}

export type AuthStackParamList = {
  [NavigationRoutes.SignIn]: undefined;
  [NavigationRoutes.SignUp]: undefined;
};

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  StackScreenProps<AuthStackParamList, T>;

export type AppStackParamList = {
  [NavigationRoutes.Onboarding]: { userId: string };
  [NavigationRoutes.Home]: undefined;
  [NavigationRoutes.Matchmaking]: undefined;
  [NavigationRoutes.Game]: { gameId: string };
  [NavigationRoutes.Results]: { gameId: string; score: number };
};

export type AppStackScreenProps<T extends keyof AppStackParamList> =
  StackScreenProps<AppStackParamList, T>;

export type RootStackParamList = AuthStackParamList & AppStackParamList;
