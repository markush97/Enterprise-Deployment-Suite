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
      // Store backend access token in localStorage
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      const entraUser: User = {
        id: params.userId,
        email: params.email,
        name: params.displayName ?? 'Anonym',
        role: 'readonly',
        isEntraId: true,
      };
      set({ user: entraUser, isAuthenticated: true });
      return response.data;
    } catch (error) {
      console.error(error)
      throw new Error('Failed to login to backend with EntraID-Token details');
    }
  },

  logout: async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await authApi.delete('/refresh', {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
      }
    } catch (e) {
      // Ignore errors, just ensure cookie is removed if possible
    }
    localStorage.removeItem('token');
    set({ user: null, isAuthenticated: false });
  },
}));

