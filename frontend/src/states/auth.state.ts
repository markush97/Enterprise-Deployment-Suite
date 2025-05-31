export type AuthState = {
    isAuthenticated: boolean;
    authToken: string | null;
    user: {
        email: string;
        id: string
        name?: string;
    } | null
}

export type AuthPersistedState = Pick<AuthState, 'authToken' | 'user'>;

export type AuthAction = {
    loginWithEntraId: (accessToken: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshAccessToken: () => Promise<string | null>;
    setAuthenticated: (isAuthenticated: boolean) => void;
}

export type AuthStore = AuthState & AuthAction;
