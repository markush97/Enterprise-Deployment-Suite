import toast from 'react-hot-toast';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { jobService } from '../services/job.service';
import { Job } from '../types/job.interface';

export function useJobs() {
  const queryClient = useQueryClient();

  const jobsQuery = useQuery<Job[]>({
    queryKey: ['jobs'],
    queryFn: jobService.getJobs,
    refetchInterval: 5000,
  });

  // Add job mutation
  const addJobMutation = useMutation({
    mutationFn: jobService.addJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add job');
      throw error;
    },
  });

  // Update job mutation
  const updateJobMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Job> }) =>
      jobService.updateJob(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update job');
      throw error;
    },
  });

  // Update job mutation
  const cancelJobMutation = useMutation({
    mutationFn: (id: string) => jobService.cancelJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job canceled successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cancel job');
      throw error;
    },
  });

  // Delete job mutation
  const deleteJobMutation = useMutation({
    mutationFn: jobService.deleteJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete job');
      throw error;
    },
  });

  return {
    jobsQuery,
    addJobMutation,
    updateJobMutation,
    deleteJobMutation,
    cancelJobMutation,
  };
}
