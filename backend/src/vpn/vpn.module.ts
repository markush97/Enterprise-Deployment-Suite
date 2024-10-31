import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { VpnController } from './vpn.controller';
import { VpnService } from './vpn.service';
import { VpnProfile } from './entities/vpn-profile.entity';
import { CustomersModule } from '../customers/customers.module';
import { VPNWireguardService } from './types/wireguard-vpn.service';
import { VPNOpenConnectService } from './types/openconnect/openconnect-vpn.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([VpnProfile]),
    CustomersModule,
  ],
  controllers: [VpnController],
  providers: [VpnService, VPNWireguardService, VPNOpenConnectService],
  exports: [VpnService],
})
export class VpnModule {}