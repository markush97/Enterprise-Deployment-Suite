import { create } from 'zustand';
import { NetworkState, NetworkInterface } from '../types/network';

// Mock network interfaces data
const mockInterfaces: NetworkInterface[] = [
  {
    name: 'eth0',
    info: {
      address: '192.168.1.100',
      netmask: '255.255.255.0',
      family: 'IPv4',
      mac: '00:1B:44:11:3A:B7',
      internal: false,
      cidr: '192.168.1.100/24',
      gateway: '192.168.1.1',
      dhcp: {
        enabled: true,
        range: {
          start: '192.168.1.200',
          end: '192.168.1.250'
        }
      }
    }
  },
  {
    name: 'eth1',
    info: {
      address: '10.0.0.100',
      netmask: '255.255.255.0',
      family: 'IPv4',
      mac: '00:1B:44:11:3A:B8',
      internal: false,
      cidr: '10.0.0.100/24',
      gateway: '10.0.0.1',
      dhcp: {
        enabled: false
      }
    }
  }
];

export const useNetworkStore = create<NetworkState>((set) => ({
  interfaces: mockInterfaces,
  isLoading: false,
  error: null,

  fetchInterfaces: async () => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ interfaces: mockInterfaces, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateInterface: async (name: string, info: Partial<NetworkInterfaceInfo>) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      set(state => ({
        interfaces: state.interfaces.map(i => 
          i.name === name ? { ...i, info: { ...i.info, ...info } } : i
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));