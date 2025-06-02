// src/hooks/useTaskBundles.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { TaskBundle } from '../types/taskbundle.interface';
import { taskBundleService } from '../services/taskbundle.service';

export function useTaskBundles() {
    const queryClient = useQueryClient();

    // Fetch task bundles
    const taskBundlesQuery = useQuery({
        queryKey: ['taskBundles'],
        queryFn: taskBundleService.getTaskBundles,
    });

    // Add task bundle mutation
    const addTaskBundleMutation = useMutation({
        mutationFn: taskBundleService.addTaskBundle,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['taskBundles'] });
            toast.success('Task bundle added successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to add task bundle');
            throw error;
        },
    });

    // Update task bundle mutation
    const updateTaskBundleMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<TaskBundle> }) =>
            taskBundleService.updateTaskBundle(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['taskBundles'] });
            toast.success('Task bundle updated successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update task bundle');
            throw error;
        },
    });

    // Delete task bundle mutation
    const deleteTaskBundleMutation = useMutation({
        mutationFn: taskBundleService.deleteTaskBundle,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['taskBundles'] });
            toast.success('Task bundle deleted successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to delete task bundle');
            throw error;
        },
    });

    return {
        taskBundlesQuery,
        addTaskBundleMutation,
        updateTaskBundleMutation,
        deleteTaskBundleMutation,
    };
}
