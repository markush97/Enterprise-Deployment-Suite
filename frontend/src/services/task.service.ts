// src/services/task.service.ts
import { api } from '../api/api.service';
import type { Task, TaskBundle } from '../types/task.interface';

export const taskService = {
    async getTasks(): Promise<Task[]> {
        const res = await api.get<Task[]>('/tasks');
        return res.data;
    },
    async addTask(data: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
        const res = await api.post<Task>('/tasks', data);
        return res.data;
    },
    async updateTask(id: string, data: Partial<Task>): Promise<Task> {
        const res = await api.patch<Task>(`/tasks/${id}`, data);
        return res.data;
    },
    async deleteTask(id: string): Promise<void> {
        await api.delete(`/tasks/${id}`);
    },
    async getTaskBundles(): Promise<TaskBundle[]> {
        const res = await api.get<TaskBundle[]>('/tasks/bundles');
        return res.data;
    },
    async addTaskBundle(data: Omit<TaskBundle, 'id' | 'createdAt' | 'taskList'>): Promise<TaskBundle> {
        const res = await api.post<TaskBundle>('/tasks/bundles', data);
        return res.data;
    },
    async updateTaskBundle(id: string, data: Partial<TaskBundle>): Promise<TaskBundle> {
        const res = await api.patch<TaskBundle>(`/tasks/bundles/${id}`, data);
        return res.data;
    },
    async deleteTaskBundle(id: string): Promise<void> {
        await api.delete(`/tasks/bundles/${id}`);
    },
    async uploadTaskContent(id: string, formData: FormData): Promise<void> {
        await api.post(`/tasks/${id}/content`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
};
