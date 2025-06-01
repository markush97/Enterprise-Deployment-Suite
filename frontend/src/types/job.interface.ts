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
    status: 'preparing' | 'imaging' | 'pxe_selection' | 'installing' | 'verifying' | 'ready' | 'done' | 'failed' | string;
    createdAt: string;
    completedAt?: string;
}
