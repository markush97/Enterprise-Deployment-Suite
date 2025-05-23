import { create } from 'zustand';
import type { AuthState, User } from '../types/auth';
import { authApi } from '../services/auth/auth.api.service'

const ENTRAID_ENDPOINT = '/sso/entraId'

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  login: async (email, password) => {
    if (email === 'admin@example.com' && password === 'password123') {
      const user: User = {
        id: '1',
        email,
        name: 'Admin User',
        role: 'administrator',
        isEntraId: false,
      };
      set({ user, isAuthenticated: true });
    } else {
      throw new Error('Invalid credentials');
    }
  },

  loginWithEntraId: async (params: { email: string; displayName?: string; userId?: string, accessToken: string }) => {
    try {
      const response = await authApi.post(`${ENTRAID_ENDPOINT}/login`, undefined, { headers: { 'Authorization': `Bearer ${params.accessToken}` } })
      console.log(response)
      return response.data;
    } catch (error) {
      console.error(error)
      throw new Error('Failed to login to backend with EntraID-Token details');
    }

    const entraUser: User = {
      id: params.userId,
      email: params.email,
      name: params.displayName ?? 'Anonym',
      role: 'readonly',
      isEntraId: true,
    };
    set({ user: entraUser, isAuthenticated: true });
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
}));

