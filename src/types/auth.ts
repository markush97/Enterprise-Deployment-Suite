export type UserRole = 'administrator' | 'readonly' | 'systemengineer';

export interface User {
  id?: string;
  email: string;
  name: string;
  role: UserRole;
  isEntraId: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithEntraId: (params: { email: string; displayName?: string; userId?: string, accessToken: string }) => Promise<void>;
  logout: () => void;
}
