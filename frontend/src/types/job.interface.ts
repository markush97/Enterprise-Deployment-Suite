import { TaskBundle } from "./task.interface";

// src/types/job.interface.ts
export interface Job {
    id: string;
    device: {
        name?: string;
        serialNumber?: string;
    };
    customer: {
        shortCode: string;
    };
    imageName: string;
    status: 'preparing' | 'imaging' | 'pxe_selection' | 'installing' | 'verifying' | 'ready' | 'done' | 'failed' | 'canceled' | 'waiting_for_instructions';
    createdAt: string;
    completedAt?: string;
    lastConnection: string;
    taskBundle: TaskBundle
}
