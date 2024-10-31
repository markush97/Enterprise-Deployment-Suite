export type JobStatus = 'preparing' | 'imaging' | 'installing' | 'verifying' | 'ready' | 'done';

export interface Job {
  id: string;
  deviceName: string;
  customerName: string;
  imageName: string;
  status: JobStatus;
  startedAt: string;
  completedAt?: string;
}