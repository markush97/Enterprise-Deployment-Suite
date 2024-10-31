export interface NetworkInterfaceInfo {
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

export interface NetworkInterface {
  name: string;
  info: NetworkInterfaceInfo;
}

export interface NetworkState {
  interfaces: NetworkInterface[];
  isLoading: boolean;
  error: string | null;
  fetchInterfaces: () => Promise<void>;
  updateInterface: (name: string, info: Partial<NetworkInterfaceInfo>) => Promise<void>;
}