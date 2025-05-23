import { Global, Module } from '@nestjs/common';

import { EMailConfigService } from './email.config.service';
import { EMailService } from './email.service';

@Global()
@Module({
  imports: [],
  providers: [EMailService, EMailConfigService],
  exports: [EMailService],
})
export class EMailModule {}
