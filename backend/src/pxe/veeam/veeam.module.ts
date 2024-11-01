import { Module } from '@nestjs/common';
import { VeeamService } from './veeam.service';
import { VeeamConfigService } from './veaam.config.service';

@Module({
  imports: [],
  controllers: [],
  providers: [VeeamService, VeeamConfigService],
})
export class VeeamModule {}
