export interface CustomerSettings {
  defaultClientImage?: string;
  defaultServerImage?: string;
  vpnProfile?: {
    type: 'cisco-anyconnect' | 'openvpn' | 'wireguard' | 'local';
    hostname: string;
    port: number;
    username: string;
    encryptedPassword: string;
    protocol: string;
    wireGuardConfig?: {
      privateKey: string;
      publicKey: string;
      endpoint: string;
      allowedIPs: string[];
      persistentKeepalive: number;
    };
  };
}

export interface Customer {
  id: string;
  name: string;
  shortCode: string;
  pulsewayId: string;
  createdAt: string;
  settings: CustomerSettings;
}

export interface CustomerState {
  customers: Customer[];
  isLoading: boolean;
  error: string | null;
  selectedCustomer: Customer | null;
  fetchCustomers: () => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Promise<void>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  updateCustomerVpn: (id: string, vpnProfile: CustomerSettings['vpnProfile']) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  setSelectedCustomer: (customer: Customer | null) => void;
}