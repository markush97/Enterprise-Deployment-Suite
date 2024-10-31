import { create } from 'zustand';
import { Job, JobStatus } from '../types/job';
import { v4 as uuidv4 } from 'uuid';

interface JobState {
  jobs: Job[];
  isLoading: boolean;
  error: string | null;
  addJob: (job: Omit<Job, 'id' | 'startedAt'>) => void;
  updateJobStatus: (id: string, status: JobStatus) => void;
  completeJob: (id: string) => void;
}

export const useJobStore = create<JobState>((set) => ({
  jobs: [],
  isLoading: false,
  error: null,

  addJob: (jobData) => {
    const newJob: Job = {
      id: uuidv4(),
      ...jobData,
      startedAt: new Date().toISOString(),
    };

    set((state) => ({
      jobs: [newJob, ...state.jobs],
    }));
  },

  updateJobStatus: (id, status) => {
    set((state) => ({
      jobs: state.jobs.map((job) =>
        job.id === id ? { ...job, status } : job
      ),
    }));
  },

  completeJob: (id) => {
    set((state) => ({
      jobs: state.jobs.map((job) =>
        job.id === id
          ? { ...job, status: 'done', completedAt: new Date().toISOString() }
          : job
      ),
    }));
  },
}));