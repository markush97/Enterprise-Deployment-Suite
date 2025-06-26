import { create } from 'zustand';

import type { JobLogEntry } from '../components/jobs/JobLogViewer.component';
import { jobService } from '../services/job.service';

interface JobLog {
  id: string;
  jobId: string;
  message: string;
  timestamp: string;
  level?: string; // optional, may not exist in backend
  taskId?: string;
}

interface JobLogStore {
  logs: Record<string, JobLog[]>; // jobId -> logs
  loading: Record<string, boolean>;
  error: Record<string, string | null>;
  fetchLogs: (jobId: string) => Promise<void>;
  clearLogs: (jobId: string) => void;
  getViewerLogs: (jobId: string) => JobLogEntry[];
}

export const useJobLogStore: import('zustand').UseBoundStore<
  import('zustand').StoreApi<JobLogStore>
> = create<JobLogStore>(set => ({
  logs: {},
  loading: {},
  error: {},
  fetchLogs: async (jobId: string) => {
    set(state => ({
      loading: { ...state.loading, [jobId]: true },
      error: { ...state.error, [jobId]: null },
    }));
    try {
      const data: JobLog[] = await jobService.getJobLogs(jobId);
      set(state => ({
        logs: { ...state.logs, [jobId]: data },
        loading: { ...state.loading, [jobId]: false },
        error: { ...state.error, [jobId]: null },
      }));
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : 'Failed to fetch logs';
      set(state => ({
        loading: { ...state.loading, [jobId]: false },
        error: { ...state.error, [jobId]: errMsg },
      }));
    }
  },
  clearLogs: (jobId: string) => {
    set(state => ({
      logs: { ...state.logs, [jobId]: [] },
      error: { ...state.error, [jobId]: null },
    }));
  },
  getViewerLogs: (jobId: string): JobLogEntry[] => {
    const logs: JobLog[] =
      typeof jobId === 'string' && jobId ? useJobLogStore.getState().logs[jobId] || [] : [];
    // Map JobLog to JobLogEntry for JobLogViewer
    return logs.map(
      (log: JobLog): JobLogEntry => ({
        timestamp: log.timestamp,
        level: log.level || 'info',
        message: log.message,
        taskId: log.taskId,
      }),
    );
  },
}));
