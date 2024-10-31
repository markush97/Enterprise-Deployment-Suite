import { Device, DeviceType, OperatingSystem } from '../types/device';
import { v4 as uuidv4 } from 'uuid';

// Mock data
let mockDevices: Device[] = [
  {
    id: '1',
    name: 'EXC-CLIENT-001',
    type: 'client',
    createdAt: '2024-03-15T10:00:00Z',
    createdBy: 'admin@cwi.at',
    macAddress: '00:1A:2B:3C:4D:5E',
    bitlockerKey: 'XYZ-123-ABC-456',
    osVersion: 'Windows 11',
    imageName: 'Windows 11 Enterprise 22H2',
  },
  {
    id: '2',
    name: 'EXC-SERVER-001',
    type: 'server',
    createdAt: '2024-03-14T09:00:00Z',
    createdBy: 'admin@cwi.at',
    macAddress: '00:1A:2B:3C:4D:5F',
    bitlockerKey: 'DEF-789-GHI-012',
    osVersion: 'Windows Server 2022',
    imageName: 'Windows Server 2022',
  },
];

export const deviceService = {
  getDevices: async (): Promise<Device[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockDevices];
  },

  addDevice: async (device: Omit<Device, 'id' | 'createdAt'>): Promise<Device> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    // Validate MAC address uniqueness
    if (mockDevices.some(d => d.macAddress === device.macAddress)) {
      throw new Error('MAC address must be unique');
    }

    const newDevice: Device = {
      ...device,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };

    mockDevices.push(newDevice);
    return newDevice;
  },

  updateDevice: async (id: string, updates: Partial<Device>): Promise<Device> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = mockDevices.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Device not found');

    // Validate MAC address uniqueness if it's being updated
    if (updates.macAddress && 
        mockDevices.some(d => d.macAddress === updates.macAddress && d.id !== id)) {
      throw new Error('MAC address must be unique');
    }

    mockDevices[index] = {
      ...mockDevices[index],
      ...updates,
    };

    return mockDevices[index];
  },

  deleteDevice: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    mockDevices = mockDevices.filter(d => d.id !== id);
  },

  getNextDeviceNumber: async (customerCode: string, type: DeviceType): Promise<number> => {
    const prefix = `${customerCode}-${type.toUpperCase()}-`;
    const existingNumbers = mockDevices
      .filter(d => d.name.startsWith(prefix))
      .map(d => parseInt(d.name.replace(prefix, ''), 10))
      .filter(n => !isNaN(n));

    return existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
  }
};