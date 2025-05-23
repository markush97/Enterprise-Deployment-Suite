import { DHCPServerConfig } from './dhcp/dhcp-config.interface';

export interface NetworkInterface {
  name: string;
  mac: string;
  addresses: NetworkAddress[];
  dhcpConfig?: DHCPServerConfig;
}

export interface NetworkAddress {
  address: string;
  netmask: string;
  family: 'IPv4' | 'IPv6';
  internal: boolean;
  cidr: string;
}
