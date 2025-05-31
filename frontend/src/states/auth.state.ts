export type AuthState = {
    isAuthenticated: boolean;
    authToken: string | null;
    user: {
        email: string;
        id: string
        name?: string;
    } | null
}

export type AuthAction = {
    loginWithEntraId: (accessToken: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshAccessToken: () => Promise<string | null>;
}

export type AuthStore = AuthState & AuthAction;
