// Mock implementation of os.networkInterfaces()
interface NetworkInterfaceInfo {
  address: string;
  netmask: string;
  family: 'IPv4' | 'IPv6';
  mac: string;
  internal: boolean;
  cidr: string | null;
  gateway?: string;
  dhcp?: {
    enabled: boolean;
    range?: {
      start: string;
      end: string;
    };
  };
}

interface NetworkInterfaces {
  [key: string]: NetworkInterfaceInfo[];
}

// Mock data simulating os.networkInterfaces()
const mockNetworkInterfaces: NetworkInterfaces = {
  'eth0': [
    {
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
  ],
  'eth1': [
    {
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
  ],
  'lo': [
    {
      address: '127.0.0.1',
      netmask: '255.0.0.0',
      family: 'IPv4',
      mac: '00:00:00:00:00:00',
      internal: true,
      cidr: '127.0.0.1/8'
    }
  ]
};

export const networkService = {
  getNetworkInterfaces: async (): Promise<NetworkInterfaces> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockNetworkInterfaces;
  },

  updateInterfaceConfig: async (
    interfaceName: string, 
    config: Partial<NetworkInterfaceInfo>
  ): Promise<NetworkInterfaceInfo> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const iface = mockNetworkInterfaces[interfaceName]?.[0];
    if (!iface) {
      throw new Error(`Interface ${interfaceName} not found`);
    }

    // Update the mock data
    mockNetworkInterfaces[interfaceName][0] = {
      ...iface,
      ...config,
    };

    return mockNetworkInterfaces[interfaceName][0];
  }
};