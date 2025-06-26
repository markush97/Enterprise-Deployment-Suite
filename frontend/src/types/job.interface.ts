import type { Device } from './device.interface';
import { TaskBundle } from './task.interface';

// src/types/job.interface.ts
export interface Job {
  id: string;
  name?: string;
  device: Device;
  customer: {
    id?: string; // <-- allow id for customer
    shortCode: string;
    name: string;
  };
  imageName: string;
  status:
    | 'preparing'
    | 'imaging'
    | 'pxe_selection'
    | 'installing'
    | 'verifying'
    | 'ready'
    | 'done'
    | 'failed'
    | 'canceled'
    | 'waiting_for_instructions'
    | 'starting'
    | 'timeout'
    | 'timout';
  createdAt: string;
  completedAt?: string;
  lastConnection: string;
  taskBundle: TaskBundle;
  startedBy?: {
    id: string;
    name: string;
    email?: string;
  };
}
