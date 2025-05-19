import { Customer } from "./customer";

export type DeviceType = 'client' | 'server';
export type OperatingSystem = 'Windows 10' | 'Windows 11' | 'Windows Server 2022' | 'Windows Server 2019';

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  createdAt: string;
  createdBy: string;
  macAddress: string;
  bitlockerKey: string;
  osVersion: OperatingSystem;
  imageName: string;
  serialNumber: string;
  customer: Customer;
  itGlueId: number;
}

export interface DeviceFilters {
  search: string;
  type: DeviceType | 'all';
  osVersion: OperatingSystem | 'all';
}
