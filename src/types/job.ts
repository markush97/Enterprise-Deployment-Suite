import { Customer } from "./customer";
import { Device } from "./device";

export type JobStatus = 'preparing' | 'imaging' | 'pxe_selection' | 'installing' | 'verifying' | 'ready' | 'done';

export interface Job {
  id: string;
  device: Device;
  deviceSerialNumber?: string;
  customer: Customer;
  imageName: string;
  createdAt: string;
  completedAt?: string;
  status: JobStatus;
}
