// src/services/job.service.ts
import { api } from '../api/api.service';
import { Job } from '../types/job.type';

export const jobService = {
  async getJobs(): Promise<Job[]> {
    const response = await api.get<Job[]>('/jobs');
    return response.data;
  },
};
