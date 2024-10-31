import { create } from 'zustand';
import { VpnProfile, createVpnProfile } from '../types/vpn';
import { wireGuard } from '../utils/mockWireGuard';
import { v4 as uuidv4 } from 'uuid';

// Mock data for development
const mockVpnProfiles: VpnProfile[] = [
  {
    id: uuidv4(),
    customerId: '1',
    name: 'Main Office VPN',
    type: 'cisco-anyconnect',
    hostname: 'vpn.example.com',
    port: 443,
    username: 'vpnuser',
    encryptedPassword: 'encrypted-password',
    protocol: 'tcp',
    testIp: '192.168.1.1',
    isDefault: true,
    createdAt: '2024-03-15T10:00:00Z',
  },
  {
    id: uuidv4(),
    customerId: '1',
    name: 'WireGuard VPN',
    type: 'wireguard',
    hostname: 'wg.example.com',
    port: 51820,
    username: '',
    encryptedPassword: '',
    protocol: 'udp',
    testIp: '10.0.0.1',
    createdAt: '2024-03-15T11:00:00Z',
    wireGuardConfig: {
      privateKey: 'private-key',
      publicKey: 'public-key',
      endpoint: 'wg.example.com:51820',
      allowedIPs: ['0.0.0.0/0'],
      persistentKeepalive: 25,
    },
  },
];

interface VpnState {
  profiles: VpnProfile[];
  isLoading: boolean;
  error: string | null;
  testingProfileId: string | null;
  fetchProfiles: (customerId: string) => Promise<void>;
  addProfile: (profile: Omit<VpnProfile, 'id' | 'createdAt' | 'encryptedPassword'> & { password: string }) => Promise<void>;
  updateProfile: (id: string, profile: Partial<Omit<VpnProfile, 'encryptedPassword'>> & { password?: string }) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  testProfile: (profile: VpnProfile) => Promise<void>;
  setDefaultProfile: (customerId: string, profileId: string) => Promise<void>;
  connectVpn: (profile: VpnProfile) => Promise<void>;
  disconnectVpn: (profile: VpnProfile) => Promise<void>;
}

export const useVpnStore = create<VpnState>((set, get) => ({
  profiles: [],
  isLoading: false,
  error: null,
  testingProfileId: null,

  fetchProfiles: async (customerId: string) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const profiles = mockVpnProfiles.filter(profile => profile.customerId === customerId);
      set({ profiles, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addProfile: async (profile) => {
    set({ isLoading: true, error: null });
    try {
      const newProfile = createVpnProfile({
        ...profile,
        encryptedPassword: profile.type === 'wireguard' ? '' : 'encrypted:' + profile.password,
        isDefault: false,
      });
      
      mockVpnProfiles.push(newProfile);
      set(state => ({
        profiles: [...state.profiles, newProfile],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateProfile: async (id, profile) => {
    set({ isLoading: true, error: null });
    try {
      const index = mockVpnProfiles.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Profile not found');

      const updatedProfile = {
        ...mockVpnProfiles[index],
        ...profile,
        encryptedPassword: profile.password ? 'encrypted:' + profile.password : mockVpnProfiles[index].encryptedPassword,
      };
      mockVpnProfiles[index] = updatedProfile;

      set(state => ({
        profiles: state.profiles.map(p => p.id === id ? updatedProfile : p),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  setDefaultProfile: async (customerId: string, profileId: string) => {
    set({ isLoading: true, error: null });
    try {
      // Remove default from all profiles for this customer
      mockVpnProfiles.forEach(profile => {
        if (profile.customerId === customerId) {
          profile.isDefault = profile.id === profileId;
        }
      });

      set(state => ({
        profiles: state.profiles.map(profile => ({
          ...profile,
          isDefault: profile.customerId === customerId ? profile.id === profileId : profile.isDefault,
        })),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  deleteProfile: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const profile = mockVpnProfiles.find(p => p.id === id);
      if (!profile) throw new Error('Profile not found');
      
      if (profile.isDefault) {
        throw new Error('Cannot delete the default VPN profile');
      }

      const index = mockVpnProfiles.findIndex(p => p.id === id);
      mockVpnProfiles.splice(index, 1);
      
      set(state => ({
        profiles: state.profiles.filter(p => p.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  testProfile: async (profile) => {
    set({ testingProfileId: profile.id, error: null });
    try {
      // Connect to VPN
      await get().connectVpn(profile);
      
      // Simulate ping test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Disconnect VPN
      await get().disconnectVpn(profile);
      
      // Update profile with test result
      const testResult = {
        id: uuidv4(),
        success: true,
        timestamp: new Date().toISOString(),
        message: 'VPN test completed successfully',
        logs: [
          'Establishing VPN connection...',
          'Connection established',
          'Testing connection...',
          `Pinging ${profile.testIp}...`,
          'Ping test successful: 45ms',
          'Disconnecting...',
          'Disconnected successfully',
        ],
        pingTime: 45,
      };
      
      await get().updateProfile(profile.id, {
        lastTestResult: testResult,
      });
      
      set({ testingProfileId: null });
    } catch (error) {
      const testResult = {
        id: uuidv4(),
        success: false,
        timestamp: new Date().toISOString(),
        message: error.message,
        logs: [
          'Establishing VPN connection...',
          `Error: ${error.message}`,
        ],
      };
      
      await get().updateProfile(profile.id, {
        lastTestResult: testResult,
      });
      
      set({ testingProfileId: null, error: error.message });
      throw error;
    }
  },

  connectVpn: async (profile: VpnProfile) => {
    set({ isLoading: true, error: null });
    try {
      if (profile.type === 'wireguard' && profile.wireGuardConfig) {
        await wireGuard.up({
          privateKey: profile.wireGuardConfig.privateKey,
          publicKey: profile.wireGuardConfig.publicKey,
          endpoint: profile.wireGuardConfig.endpoint,
          allowedIPs: profile.wireGuardConfig.allowedIPs,
          persistentKeepalive: profile.wireGuardConfig.persistentKeepalive,
        });
      } else {
        throw new Error('VPN type not supported for connection');
      }
      set({ isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  disconnectVpn: async (profile: VpnProfile) => {
    set({ isLoading: true, error: null });
    try {
      if (profile.type === 'wireguard') {
        await wireGuard.down();
      } else {
        throw new Error('VPN type not supported for disconnection');
      }
      set({ isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
}));