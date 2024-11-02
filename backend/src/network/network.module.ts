import { Module } from '@nestjs/common';
import { NetworkController } from './network.controller';
import { NetworkService } from './network.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { NetworkInterfaceEntity } from './entities/networkinterface.entity';
import { DHCPModule } from './dhcp/dhcp.module';

@Module({
  imports: [MikroOrmModule.forFeature([NetworkInterfaceEntity]), DHCPModule],
  controllers: [NetworkController],
  providers: [NetworkService],
  exports: [NetworkService],
})
export class NetworkModule {}