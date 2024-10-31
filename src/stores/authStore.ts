import { create } from 'zustand';
import type { AuthState, User } from '../types/auth';

// Mock user for development
const MOCK_USER = {
  id: '1',
  email: 'admin@cwi.at',
  name: 'Admin User',
  role: 'administrator',
  isEntraId: false,
};

export const useAuthStore = create<AuthState>((set) => ({
  // Start with authenticated state for development
  user: MOCK_USER,
  isAuthenticated: true,

  login: async (email: string, password: string) => {
    set({ user: MOCK_USER, isAuthenticated: true });
  },

  loginWithEntraId: async () => {
    throw new Error('EntraID login not implemented');
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
}));