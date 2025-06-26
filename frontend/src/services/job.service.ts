import { api } from '../api/api.service';
import type { Job } from '../types/job.interface';

export const jobService = {
  async getJobs(): Promise<Job[]> {
    const response = await api.get<Job[]>('/jobs');
    return response.data;
  },

  async getJob(id: string): Promise<Job> {
    const response = await api.get<Job>(`/jobs/${id}`);
    return response.data;
  },

  async addJob(data: Omit<Job, 'id' | 'createdAt'>): Promise<Job> {
    const response = await api.post<Job>('/jobs', data);
    return response.data;
  },
  async updateJob(id: string, data: Partial<Job>): Promise<Job> {
    const response = await api.patch<Job>(`/jobs/${id}`, data);
    return response.data;
  },
  async deleteJob(id: string): Promise<void> {
    await api.delete(`/jobs/${id}`);
  },

  async cancelJob(id: string): Promise<void> {
    await api.put(`/jobs/${id}/status?jobStatus=canceled`);
  },

  async startJob(id: string): Promise<void> {
    await api.put(`/jobs/${id}/status?jobStatus=starting`);
  },

  async assignCustomerOrTaskBundle(
    id: string,
    data: { customerId?: string; taskBundleId?: string },
  ): Promise<Job> {
    const response = await api.put<Job>(`/jobs/${id}`, data);
    return response.data;
  },

  async getJobLogs(jobId: string) {
    const response = await api.get(`/jobs/${jobId}/logs`);
    return response.data;
  },
};
