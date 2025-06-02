// src/hooks/useTasks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Task, TaskBundle } from '../types/task.interface';
import { taskService } from '../services/task.service';

export function useTasks() {
    const queryClient = useQueryClient();

    // Fetch tasks
    const tasksQuery = useQuery({
        queryKey: ['tasks'],
        queryFn: taskService.getTasks,
    });

    // Add task mutation
    const addTaskMutation = useMutation({
        mutationFn: taskService.addTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            toast.success('Task added successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to add task');
            throw error;
        },
    });

    // Update task mutation
    const updateTaskMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) =>
            taskService.updateTask(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            toast.success('Task updated successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update task');
            throw error;
        },
    });

    // Delete task mutation
    const deleteTaskMutation = useMutation({
        mutationFn: taskService.deleteTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            toast.success('Task deleted successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to delete task');
            throw error;
        },
    });

    // Task bundles
    const taskBundlesQuery = useQuery({
        queryKey: ['taskBundles'],
        queryFn: taskService.getTaskBundles,
    });

    const addTaskBundleMutation = useMutation({
        mutationFn: taskService.addTaskBundle,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['taskBundles'] });
            toast.success('Task bundle added successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to add task bundle');
            throw error;
        },
    });

    const updateTaskBundleMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<TaskBundle> }) =>
            taskService.updateTaskBundle(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['taskBundles'] });
            toast.success('Task bundle updated successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update task bundle');
            throw error;
        },
    });

    const deleteTaskBundleMutation = useMutation({
        mutationFn: taskService.deleteTaskBundle,
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
        tasksQuery,
        addTaskMutation,
        updateTaskMutation,
        deleteTaskMutation,
        taskBundlesQuery,
        addTaskBundleMutation,
        updateTaskBundleMutation,
        deleteTaskBundleMutation,
    };
}
