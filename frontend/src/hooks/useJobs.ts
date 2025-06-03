import { useQuery } from '@tanstack/react-query';
import { jobService } from '../services/job.service';
import { Job } from '../types/job.interface';

export function useJobs() {
  return useQuery<Job[]>({
    queryKey: ['jobs'],
    queryFn: jobService.getJobs,
    refetchInterval: 5000,
  });
}
