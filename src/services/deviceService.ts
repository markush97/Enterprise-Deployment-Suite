import { Device, DeviceType } from '../types/device';
import { api } from './api.service';

const DEVICES_ENDPOINT = '/devices';

export const deviceService = {
  getDevices: async (): Promise<Device[]> => {
    try {
      const response = await api.get(DEVICES_ENDPOINT);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch devices:', error);
      throw new Error('Failed to fetch devices');
    }
  },

  getDeviceById: async (id: string): Promise<Device> => {
    try {
      const response = await api.get(`${DEVICES_ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch device ${id}:`, error);
      throw new Error('Failed to fetch device details');
    }
  },

  addDevice: async (device: Omit<Device, 'id' | 'createdAt'>): Promise<Device> => {
    try {
      const response = await api.post(DEVICES_ENDPOINT, device);
      return response.data;
    } catch (error: any) {
      console.error('Failed to add device:', error);
      if (error.response?.data?.message === 'MAC address already exists') {
        throw new Error('MAC address must be unique');
      }
      throw new Error('Failed to add device');
    }
  },

  updateDevice: async (id: string, updates: Partial<Device>): Promise<Device> => {
    try {
      const response = await api.put(`${DEVICES_ENDPOINT}/${id}`, updates);
      return response.data;
    } catch (error: any) {
      console.error(`Failed to update device ${id}:`, error);
      if (error.response?.data?.message === 'MAC address already exists') {
        throw new Error('MAC address must be unique');
      }
      throw new Error('Failed to update device');
    }
  },

  deleteDevice: async (id: string): Promise<void> => {
    try {
      await api.delete(`${DEVICES_ENDPOINT}/${id}`);
    } catch (error) {
      console.error(`Failed to delete device ${id}:`, error);
      throw new Error('Failed to delete device');
    }
  },

  getNextDeviceNumber: async (customerCode: string, type: DeviceType): Promise<number> => {
    try {
      const response = await api.get(`${DEVICES_ENDPOINT}/next-number`, {
        params: { customerCode, type }
      });
      return response.data.number;
    } catch (error) {
      console.error('Failed to get next device number:', error);
      throw new Error('Failed to get next device number');
    }
  }
};
