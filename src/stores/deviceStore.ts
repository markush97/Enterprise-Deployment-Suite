import { create } from 'zustand';
import { Device, DeviceFilters } from '../types/device';
import { deviceService } from '../services/deviceService';

interface DeviceState {
  devices: Device[];
  isLoading: boolean;
  error: string | null;
  filters: DeviceFilters;
  fetchDevices: () => Promise<void>;
  addDevice: (device: Omit<Device, 'id' | 'createdAt'>) => Promise<void>;
  updateDevice: (id: string, device: Partial<Device>) => Promise<void>;
  deleteDevice: (id: string) => Promise<void>;
  setFilters: (filters: Partial<DeviceFilters>) => void;
}

export const useDeviceStore = create<DeviceState>((set, get) => ({
  devices: [],
  isLoading: false,
  error: null,
  filters: {
    search: '',
    type: 'all',
    osVersion: 'all',
  },

  fetchDevices: async () => {
    set({ isLoading: true, error: null });
    try {
      const devices = await deviceService.getDevices();
      set({ devices, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addDevice: async (device) => {
    set({ isLoading: true, error: null });
    try {
      const newDevice = await deviceService.addDevice(device);
      set(state => ({
        devices: [...state.devices, newDevice],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateDevice: async (id, device) => {
    set({ isLoading: true, error: null });
    try {
      const updatedDevice = await deviceService.updateDevice(id, device);
      set(state => ({
        devices: state.devices.map(d => d.id === id ? updatedDevice : d),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  deleteDevice: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await deviceService.deleteDevice(id);
      set(state => ({
        devices: state.devices.filter(d => d.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  setFilters: (filters) => {
    set(state => ({
      filters: { ...state.filters, ...filters },
    }));
  },
}));