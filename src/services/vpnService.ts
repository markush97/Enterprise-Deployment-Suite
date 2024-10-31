import { exec } from '../utils/exec';
import { VpnProfile, VpnTestResult } from '../types/vpn';

class VpnService {
  private async executeCommand(command: string, hidePasswords = true): Promise<string> {
    try {
      const output = await exec(command);
      if (hidePasswords) {
        // Remove sensitive information from logs
        return output.replace(/(?<=password=)[^\s]+/g, '***')
                    .replace(/(?<=passwd=)[^\s]+/g, '***')
                    .replace(/(?<=--password=)[^\s]+/g, '***');
      }
      return output;
    } catch (error) {
      throw new Error(`Failed to execute command: ${error.message}`);
    }
  }

  private async pingTest(ip: string): Promise<number> {
    try {
      const start = Date.now();
      await exec(`ping -c 1 ${ip}`);
      return Date.now() - start;
    } catch (error) {
      throw new Error('Ping test failed');
    }
  }

  async testVpnConnection(profile: VpnProfile): Promise<VpnTestResult> {
    const logs: string[] = [];
    try {
      // Connect to VPN
      logs.push('Establishing VPN connection...');
      await this.connectVpn(profile, (log) => logs.push(log));

      // Test connection
      logs.push('Testing connection...');
      const pingTime = await this.pingTest(profile.testIp);
      logs.push(`Ping successful: ${pingTime}ms`);

      // Disconnect
      logs.push('Disconnecting...');
      await this.disconnectVpn(profile, (log) => logs.push(log));

      return {
        success: true,
        timestamp: new Date().toISOString(),
        message: 'VPN test completed successfully',
        logs,
        pingTime,
      };
    } catch (error) {
      logs.push(`Error: ${error.message}`);
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: error.message,
        logs,
      };
    }
  }

  async connectVpn(profile: VpnProfile, logCallback?: (log: string) => void): Promise<void> {
    const command = this.buildConnectCommand(profile);
    try {
      await this.executeCommand(command);
      if (logCallback) logCallback('Connected successfully');
    } catch (error) {
      if (logCallback) logCallback(`Connection failed: ${error.message}`);
      throw error;
    }
  }

  async disconnectVpn(profile: VpnProfile, logCallback?: (log: string) => void): Promise<void> {
    const command = this.buildDisconnectCommand(profile);
    try {
      await this.executeCommand(command);
      if (logCallback) logCallback('Disconnected successfully');
    } catch (error) {
      if (logCallback) logCallback(`Disconnection failed: ${error.message}`);
      throw error;
    }
  }

  private buildConnectCommand(profile: VpnProfile): string {
    switch (profile.type) {
      case 'openconnect':
        return this.buildOpenConnectCommand(profile);
      case 'fortinet':
        return this.buildFortinetCommand(profile);
      case 'wireguard':
        return this.buildWireGuardCommand(profile);
      default:
        throw new Error(`Unsupported VPN type: ${profile.type}`);
    }
  }

  private buildDisconnectCommand(profile: VpnProfile): string {
    switch (profile.type) {
      case 'openconnect':
      case 'fortinet':
        return 'pkill openconnect';
      case 'wireguard':
        return 'wg-quick down wg0';
      default:
        throw new Error(`Unsupported VPN type: ${profile.type}`);
    }
  }

  private buildOpenConnectCommand(profile: VpnProfile): string {
    const config = profile.openConnectConfig;
    if (!config) throw new Error('OpenConnect configuration missing');

    let command = `echo "${profile.encryptedPassword}" | openconnect`;
    
    switch (config.vendor) {
      case 'anyconnect':
        command += ' --protocol=anyconnect';
        break;
      case 'globalprotect':
        command += ' --protocol=gp';
        break;
      case 'fortinet':
        command += ' --protocol=fortinet';
        break;
    }

    if (config.authGroup) command += ` --authgroup="${config.authGroup}"`;
    if (config.certificate) command += ` --certificate="${config.certificate}"`;
    if (config.servercert) command += ` --servercert="${config.servercert}"`;

    command += ` --user="${profile.username}"`;
    command += ` --passwd-on-stdin`;
    command += ` ${profile.hostname}:${profile.port}`;

    return command;
  }

  private buildFortinetCommand(profile: VpnProfile): string {
    const config = profile.fortinetConfig;
    if (!config) throw new Error('Fortinet configuration missing');

    let command = `echo "${profile.encryptedPassword}" | openconnect`;
    command += ' --protocol=fortinet';
    
    if (config.realm) command += ` --realm="${config.realm}"`;
    if (config.certificate) command += ` --certificate="${config.certificate}"`;
    if (config.trusthost) command += ` --trusted-cert="${config.trusthost}"`;

    command += ` --user="${profile.username}"`;
    command += ` --passwd-on-stdin`;
    command += ` ${profile.hostname}:${profile.port}`;

    return command;
  }

  private buildWireGuardCommand(profile: VpnProfile): string {
    const config = profile.wireGuardConfig;
    if (!config) throw new Error('WireGuard configuration missing');

    // Create WireGuard configuration file
    const wgConfig = `
[Interface]
PrivateKey = ${config.privateKey}
Address = ${config.allowedIPs.join(',')}

[Peer]
PublicKey = ${config.publicKey}
Endpoint = ${config.endpoint}
AllowedIPs = ${config.allowedIPs.join(',')}
PersistentKeepalive = ${config.persistentKeepalive}
`;

    // Save config and start WireGuard
    return `echo "${wgConfig}" > /etc/wireguard/wg0.conf && wg-quick up wg0`;
  }
}

export const vpnService = new VpnService();