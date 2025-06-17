import { TaskBundle } from "./task.interface";

// src/types/job.interface.ts
export interface Job {
    id: string;
    device: {
        id: string; // <-- ensure deviceId is always present
        name?: string;
        serialNumber?: string;
        type?: string;
    };
    customer: {
        id?: string; // <-- allow id for customer
        shortCode: string;
    };
    imageName: string;
    status: 'preparing' | 'imaging' | 'pxe_selection' | 'installing' | 'verifying' | 'ready' | 'done' | 'failed' | 'canceled' | 'waiting_for_instructions' | 'starting';
    createdAt: string;
    completedAt?: string;
    lastConnection: string;
    taskBundle: TaskBundle
}
