import { randomUUID } from 'crypto';

import { Logger } from '@nestjs/common';

import { VpnProfile } from '../entities/vpn-profile.entity';
import { VPNConnection } from '../vpn.connection.interface';

export abstract class VPNTypeService {
  private readonly typeLogger = new Logger('VPNTypeService');

  /**
   * Startup a VPN-Tunnel and register it in the vpn service
   * @param config
   */
  async connectTunnel(profile: VpnProfile): Promise<VPNConnection> {
    const connectionId = randomUUID();
    this.typeLogger.log(
      `Setting up ${profile.type} VPN to ${profile.hostname} as connectionId ${connectionId}...`,
    );
    return {
      id: connectionId,
      up: false,
      creationTime: new Date(),
      profile,
      down: () => {},
    };
  }

  /**
   * Disconnect VPN Tunnel
   * @param config
   */
  async disconnectTunnel(connection: VPNConnection): Promise<VPNConnection> {
    await connection.down();

    connection.creationTime = undefined;
    connection.up = false;
    connection.id = undefined;
    connection.down = () => {};

    return connection;
  }
}
