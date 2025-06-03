import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { API_URL } from '../configs/api.config';
import { useAuthStore } from '../states/auth.store';
import toast from 'react-hot-toast';


export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach Authorization header to every request using a request interceptor
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = useAuthStore.getState().authToken;
        if (token) {
            config.headers = config.headers || {};
            (config.headers as any)['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

// Add a response interceptor to handle 401 and refresh token
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as any;
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshedToken = await useAuthStore.getState().refreshAccessToken();
                if (refreshedToken) {
                    originalRequest.headers['Authorization'] = `Bearer ${refreshedToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // If refresh fails, logout or redirect to login if needed
                await useAuthStore.getState().logout();
            }
        }
        // Enhanced error handling: log error and show user-friendly message if needed
        if (
            (error.response && error.response.status >= 500) ||
            !(error.response?.data && (error.response.data as any).mtiErrorCode)
        ) {
            toast.error(
                'An unexpected error occurred. Please try again later.')
            console.error('API Error:', error.response?.status, error.response?.data);
            return Promise.reject(error)
        }

        return Promise.resolve(null);
    }
);
