import { create } from 'zustand';

interface SystemInfo {
  version: string;
  uptime: number;
  diskSpace: {
    total: number;
    used: number;
    free: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
  };
  cpu: {
    cores: number;
    usage: number;
    temperature: number;
  };
}

interface SystemState {
  info: SystemInfo | null;
  isLoading: boolean;
  error: string | null;
  fetchSystemInfo: () => Promise<void>;
}

// Mock system information
const mockSystemInfo: SystemInfo = {
  version: '1.0.0-beta',
  uptime: 345600, // 4 days in seconds
  diskSpace: {
    total: 1000 * 1024 * 1024 * 1024, // 1TB
    used: 600 * 1024 * 1024 * 1024,   // 600GB
    free: 400 * 1024 * 1024 * 1024,   // 400GB
  },
  memory: {
    total: 32 * 1024 * 1024 * 1024,   // 32GB
    used: 24 * 1024 * 1024 * 1024,    // 24GB
    free: 8 * 1024 * 1024 * 1024,     // 8GB
  },
  cpu: {
    cores: 8,
    usage: 45.5,
    temperature: 65.3,
  },
};

export const useSystemStore = create<SystemState>((set) => ({
  info: null,
  isLoading: false,
  error: null,

  fetchSystemInfo: async () => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update CPU usage randomly
      const info = {
        ...mockSystemInfo,
        cpu: {
          ...mockSystemInfo.cpu,
          usage: Math.random() * 100,
          temperature: 60 + Math.random() * 20,
        },
      };
      
      set({ info, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));