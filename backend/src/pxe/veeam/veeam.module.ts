import { Module } from '@nestjs/common';

import { VeeamConfigService } from './veaam.config.service';
import { VeeamService } from './veeam.service';

@Module({
  imports: [],
  controllers: [],
  providers: [VeeamService, VeeamConfigService],
})
export class VeeamModule {}
