import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DHCPConfigService } from './dhcp.config.service';
import { DHCPService } from './dhcp.service';

@Module({
  imports: [],
  controllers: [],
  providers: [DHCPService, DHCPConfigService],
  exports: [DHCPService]
})
export class DHCPModule {}
