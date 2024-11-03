import { Module } from '@nestjs/common';
import { NetworkController } from './network.controller';
import { NetworkService } from './network.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { NetworkInterfaceEntity } from './entities/network-interface.entity';
import { DHCPModule } from './dhcp/dhcp.module';
import { NetworkConfigService } from './network.config.service';

@Module({
  imports: [MikroOrmModule.forFeature([NetworkInterfaceEntity]), DHCPModule],
  controllers: [NetworkController],
  providers: [NetworkService, NetworkConfigService],
  exports: [NetworkService],
})
export class NetworkModule {}