import { Module } from '@nestjs/common';

import { MikroOrmModule } from '@mikro-orm/nestjs';

import { DHCPModule } from './dhcp/dhcp.module';
import { NetworkInterfaceEntity } from './entities/network-interface.entity';
import { NetworkConfigService } from './network.config.service';
import { NetworkController } from './network.controller';
import { NetworkService } from './network.service';

@Module({
  imports: [MikroOrmModule.forFeature([NetworkInterfaceEntity]), DHCPModule],
  controllers: [NetworkController],
  providers: [NetworkService, NetworkConfigService],
  exports: [NetworkService],
})
export class NetworkModule {}
