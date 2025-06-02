// src/services/taskbundle.service.ts
import { api } from '../api/api.service';
import type { TaskBundle } from '../types/taskbundle.interface';

export const taskBundleService = {
    async getTaskBundles(): Promise<TaskBundle[]> {
        const res = await api.get<TaskBundle[]>('/tasks/bundles');
        return res.data;
    },
    async getTaskBundle(bundleId: string): Promise<TaskBundle> {
        const res = await api.get<TaskBundle>(`/tasks/bundles/${bundleId}`);
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

    async assignAndOrderTasks(taskbundleId: string, taskIds: string[]): Promise<void> {
        await api.post(`/tasks/bundles/${taskbundleId}/tasks`, { taskIds });
    },

    async deleteTaskBundle(id: string): Promise<void> {
        await api.delete(`/tasks/bundles/${id}`);
    },

    async addTaskToBundle(taskBundleId: string, taskId: string): Promise<void> {
        await api.post(`/tasks/${taskId}/bundles/${taskBundleId}`);
    },

};
