import { create } from 'zustand';
import { AuthState, AuthStore } from './auth.state';
import { persist } from 'zustand/middleware';
import { AUTH_ENTRAID_URL, authApi } from '../api/auth.api.service';

const initialState: AuthState = {
    isAuthenticated: false,
    authToken: null,
    user: null,
};

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            ...initialState,
            loginWithEntraId: async (entraIdAccessToken: string) => {
                try {
                    const response = await authApi.post(`${AUTH_ENTRAID_URL}/login`, undefined, { headers: { 'Authorization': `Bearer ${entraIdAccessToken}` } });
                    const backendToken = response.data?.token;

                    if (backendToken) {
                        const user = {
                            email: response.data?.email,
                            id: response.data?.id,
                            name: response.data?.name
                        }
                        set({ authToken: backendToken, isAuthenticated: true, user });
                    }
                    return response.data;
                } catch (error) {
                    throw new Error('Failed to login to backend with EntraID-Token details');
                }
            },
            logout: async () => {
                try {
                    const token = get().authToken
                    if (token) {
                        await authApi.delete('/refresh', {
                            headers: { Authorization: `Bearer ${token}` },
                            withCredentials: true,
                        });
                    }
                } catch (e) {
                    // Ignore errors, just ensure cookie is removed if possible
                }
                set(initialState);
            },
        }),
        {
            name: 'auth-token-storage',
            partialize: (state) => ({ authToken: state.authToken, user: state.user }),
            onRehydrateStorage: () => (state) => {
                // Restore isAuthenticated if token exists
                if (state?.authToken) {
                    state.isAuthenticated = true;
                }
            },
        }
    ),
)
