import { api } from './api.service';

export const systemService = {
    getSystemInfo: async () => {
        try {
            const response = await api.get('/system');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch system info:', error);
            throw new Error('Failed to fetch system information');
        }
    }
};
