export type AuthState = {
    isAuthenticated: boolean;
    authToken: string | null;
    user: {
        email: string;
        id: string
    } | null
}

export type AuthAction = {
    loginWithEntraId: (accessToken: string) => Promise<void>;
    logout: () => Promise<void>;
}

export type AuthStore = AuthState & AuthAction;
