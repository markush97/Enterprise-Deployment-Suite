import { rm } from 'fs/promises';
import { join } from 'path';
import { BadRequestMTIException } from 'src/core/errorhandling/exceptions/bad-request.mti-exception';
import { MTIErrorCodes } from 'src/core/errorhandling/exceptions/mti.error-codes.enum';
import { VpnProfile, VpnType } from 'src/vpn/entities/vpn-profile.entity';
import { VPNConnection } from 'src/vpn/vpn.connection.interface';
import { WgConfig } from 'wireguard-tools';

import { Injectable, Logger } from '@nestjs/common';

import { VPNTypeService } from '../vpn-type.service';

const wireguardConfigFile = (connectionId: string): string => {
  return join('./', '/config', `/wg-${connectionId}.conf`);
};

@Injectable()
export class VPNWireguardService extends VPNTypeService {
  protected readonly logger = new Logger('VPNWireguardService');

  override async connectTunnel(profile: VpnProfile): Promise<VPNConnection> {
    if (
      profile.type != VpnType.WIREGUARD ||
      !profile.wireGuardConfig ||
      !profile.wireGuardConfig.allowedIPs ||
      !profile.wireGuardConfig.endpoint ||
      !profile.wireGuardConfig.persistentKeepalive ||
      !profile.wireGuardConfig.privateKey ||
      !profile.wireGuardConfig.publicKey
    ) {
      throw new BadRequestMTIException(
        MTIErrorCodes.INVALID_VPN_CONFIG,
        `The VPN-Profile with id ${profile.id} is not a valid WireGuard-Config`,
      );
    }

    const connection = await super.connectTunnel(profile);

    const filePath = wireguardConfigFile(connection.id);
    const wireguardConfig = new WgConfig({
      wgInterface: {
        address: [profile.wireGuardConfig.endpoint],
        privateKey: profile.wireGuardConfig.privateKey,
        name: connection.id,
      },
      peers: [
        {
          allowedIps: profile.wireGuardConfig.allowedIPs,
          publicKey: profile.wireGuardConfig.publicKey,
          endpoint: profile.hostname + ':' + (profile.port ?? 51820),
        },
      ],
      filePath,
    });

    await wireguardConfig.writeToFile();
    await wireguardConfig.up();

    connection.up = true;
    connection.down = async () => {
      await wireguardConfig.down();
      await rm(wireguardConfigFile(connection.id));
    };

    return connection;
  }

  override async disconnectTunnel(connection: VPNConnection): Promise<VPNConnection> {
    if (connection.profile.type != VpnType.WIREGUARD || !connection.up) {
      return;
    }

    return super.disconnectTunnel(connection);
  }
}
