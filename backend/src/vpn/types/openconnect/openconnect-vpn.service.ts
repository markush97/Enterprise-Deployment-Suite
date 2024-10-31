import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { join } from 'path';
import { rm } from 'fs/promises';
import { checkOpenconnectIsInstalled, connect } from './lib/openconnect.helper'
import { VPNTypeService } from '../vpn-type.service';
import { VpnProfile, VpnType } from 'src/vpn/entities/vpn-profile.entity';
import { BadRequestMTIException } from 'src/core/errorhandling/exceptions/bad-request.mti-exception';
import { MTIErrorCodes } from 'src/core/errorhandling/exceptions/mti.error-codes.enum';
import { Connection } from '@mikro-orm/core';
import { profile } from 'console';
import { VPNConnection } from 'src/vpn/vpn.connection.interface';

@Injectable()
export class VPNOpenConnectService extends VPNTypeService implements OnModuleInit {
    async onModuleInit() {
        await checkOpenconnectIsInstalled();
    }
    protected readonly logger = new Logger('VPNWireguardService');

    override async connectTunnel(profile: VpnProfile) {
        if (
            profile.type != VpnType.CISCO_ANYCONNECT &&
            profile.type != VpnType.FORTINET &&
            profile.type != VpnType.GP &&
            profile.type != VpnType.OPENCONNECT ||
            !profile.openConnectConfig ||
            !profile.openConnectConfig.username ||
            !profile.openConnectConfig.password ||
            !profile.openConnectConfig.authGroup
        ) {
            throw new BadRequestMTIException(MTIErrorCodes.INVALID_VPN_CONFIG, `The VPN-Profile with id ${profile.id} is not a valid OpenConnect-Config`);
        }

        const connection = await super.connectTunnel(profile);

        await connect(profile.hostname + (profile.port ?? 443), profile.openConnectConfig.username, profile.openConnectConfig.password, profile.openConnectConfig.authGroup, connection.id, profile.type);

        connection.up = true;
        return connection;
    }

    override async disconnectTunnel(connection: VPNConnection): Promise<VPNConnection> {
        if (
            connection.profile.type != VpnType.CISCO_ANYCONNECT &&
            connection.profile.type != VpnType.FORTINET &&
            connection.profile.type != VpnType.GP &&
            connection.profile.type != VpnType.OPENCONNECT ||
            !connection.up
        ) {
            return;
        }

        return super.disconnectTunnel(connection);

    }
}