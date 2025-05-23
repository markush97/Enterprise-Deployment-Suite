import { Module } from '@nestjs/common';

import { MikroOrmModule } from '@mikro-orm/nestjs';

import { CustomersModule } from '../customers/customers.module';
import { VpnProfile } from './entities/vpn-profile.entity';
import { VPNOpenConnectService } from './types/openconnect/openconnect-vpn.service';
import { VPNWireguardService } from './types/wireguard/wireguard-vpn.service';
import { VpnController } from './vpn.controller';
import { VpnService } from './vpn.service';

@Module({
  imports: [MikroOrmModule.forFeature([VpnProfile]), CustomersModule],
  controllers: [VpnController],
  providers: [VpnService, VPNWireguardService, VPNOpenConnectService],
  exports: [VpnService],
})
export class VpnModule {}
