import { api } from '../api/api.service';
import type { Job } from '../types/job.interface';

export const jobService = {
    async getJobs(): Promise<Job[]> {
        const response = await api.get<Job[]>('/jobs');
        return response.data;
    },
};
