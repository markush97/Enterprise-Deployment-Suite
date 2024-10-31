import { v4 as uuidv4 } from 'uuid';

export type VpnType = 'cisco-anyconnect' | 'openconnect' | 'fortinet' | 'wireguard' | 'local';
export type VpnVendor = 'anyconnect' | 'globalprotect' | 'fortinet';

export interface VpnTestResult {
  id: string;
  success: boolean;
  timestamp: string;
  message: string;
  logs: string[];
  pingTime?: number;
}

export interface WireGuardConfig {
  privateKey: string;
  publicKey: string;
  endpoint: string;
  allowedIPs: string[];
  persistentKeepalive: number;
}

export interface OpenConnectConfig {
  vendor: VpnVendor;
  authGroup?: string;
  certificate?: string;
  servercert?: string;
}

export interface FortinetConfig {
  realm?: string;
  certificate?: string;
  trusthost?: string;
}

export interface VpnProfile {
  id: string;
  customerId: string;
  name: string;
  type: VpnType;
  hostname: string;
  port: number;
  username: string;
  encryptedPassword: string;
  protocol: string;
  testIp: string;
  isDefault?: boolean;
  lastTestResult?: VpnTestResult;
  wireGuardConfig?: WireGuardConfig;
  openConnectConfig?: OpenConnectConfig;
  fortinetConfig?: FortinetConfig;
  createdAt: string;
}

export const createVpnProfile = (data: Omit<VpnProfile, 'id' | 'createdAt'>): VpnProfile => ({
  id: uuidv4(),
  createdAt: new Date().toISOString(),
  ...data,
});