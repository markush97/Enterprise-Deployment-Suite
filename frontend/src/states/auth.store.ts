import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AUTH_ENTRAID_URL, authApi } from '../api/auth.api.service';
import { api } from '../api/api.service';

type AuthState = {
    isAuthenticated: boolean;
    authToken: string | null;
    user: {
        email: string;
        id: string
        name?: string;
    } | null
}

type AuthAction = {
    loginWithEntraId: (accessToken: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshAccessToken: () => Promise<string | null>;
    setAuthenticated: (isAuthenticated: boolean) => void;
}

type AuthStore = AuthState & AuthAction;


const initialState: AuthState = {
    isAuthenticated: false,
    authToken: null,
    user: null,
};

// Multi-tab sync: Listen for storage events and call logout() action if token is removed in another tab
if (typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => {
        if (event.key === 'auth-token-storage' && !event.newValue) {
            const logout = useAuthStore.getState().logout;
            // Make sure logout function is already defined
            if (typeof logout === 'function') {
                logout();
            }
        }
    });
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            ...initialState,
            setAuthenticated: (isAuthenticated: boolean) => {
                set({ isAuthenticated });
            },
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
                        await authApi.post(`/logout`);
                    }
                } catch (e) {
                    // Ignore errors, just ensure cookie is removed if possible
                }
                set(initialState);
            },
            refreshAccessToken: async () => {
                const token = get().authToken;
                if (!token) return null;
                let attempts = 0;
                while (attempts < 3) {
                    try {
                        const response = await authApi.post('/refresh');
                        const backendToken = response.data?.token;
                        if (backendToken) {
                            const user = {
                                email: response.data?.email,
                                id: response.data?.id,
                                name: response.data?.name
                            }
                            set({ authToken: backendToken, isAuthenticated: true, user });
                            return backendToken;
                        }
                        return null;
                    } catch (error: any) {
                        if (error?.response?.status === 404) {
                            // Error 404 indicates that the refresh token is invalid or expired
                            set(initialState);
                            return null;
                        }
                        attempts++;
                        if (attempts >= 3) {
                            set(initialState);
                            return null;
                        }
                    }
                }
                return null;
            },
        }),
        {
            name: 'auth-token-storage',
            partialize: (state) => ({ authToken: state.authToken, user: state.user }),
            onRehydrateStorage: () => async (state) => {
                // Restore isAuthenticated if token exists
                if (state?.authToken) {
                    try {
                        // Validate token by calling a protected endpoint
                        await api.post('/auth/validate', undefined, { responseType: 'text', validateStatus: (status) => status >= 200 && status < 300 });
                        state.setAuthenticated(true);
                    } catch (error: any) {
                        // If 401, the api interceptor will attempt refresh automatically
                        // If refresh fails, user will be logged out by the interceptor
                        await state.logout();
                    }
                }
            },
        }
    ),
)
