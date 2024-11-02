import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DHCPConfigService } from './dhcp.config.service';
import { DHCPService } from './dhcp.service';
import { MikroORM } from '@mikro-orm/sqlite';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { DHCPServerConfigEntity } from './entities/dhcp-config.entity';

@Module({
  imports: [MikroOrmModule.forFeature([DHCPServerConfigEntity])],
  controllers: [],
  providers: [DHCPService, DHCPConfigService],
  exports: [DHCPService]
})
export class DHCPModule {}
