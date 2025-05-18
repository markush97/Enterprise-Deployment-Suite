import { Job } from '../types/job';
import { api } from './api.service';

const JOBS_ENDPOINT = '/jobs';

export const jobService = {
    getJobs: async (): Promise<Job[]> => {
        try {
            const response = await api.get(JOBS_ENDPOINT);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
            throw new Error('Failed to fetch jobs');
        }
    },

    getJobById: async (id: string): Promise<Job> => {
        try {
            const response = await api.get(`${JOBS_ENDPOINT}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Failed to fetch job ${id}:`, error);
            throw new Error('Failed to fetch job details');
        }
    },

    startJob: async (data: { deviceId?: string; deviceSerialNumber?: string; customerId?: string; imageId: string }): Promise<Job> => {
        try {
            const response = await api.post(JOBS_ENDPOINT, data);
            return response.data;
        } catch (error) {
            console.error('Failed to start job:', error);
            throw new Error('Failed to start job');
        }
    },

    cancelJob: async (id: string): Promise<void> => {
        try {
            await api.delete(`${JOBS_ENDPOINT}/${id}`);
        } catch (error) {
            console.error(`Failed to cancel job ${id}:`, error);
            throw new Error('Failed to cancel job');
        }
    }
};
