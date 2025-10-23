export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
}

export const EmptyUser: User = {
  id: '',
  username: '',
  email: '',
  avatarUrl: '',
};
