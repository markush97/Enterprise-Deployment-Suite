import { Global, Module } from '@nestjs/common';

import { TemplatingConfigService } from './templating.config.service';
import { CoreTemplatingService } from './templating.service';

@Global()
@Module({
  providers: [TemplatingConfigService, CoreTemplatingService],
  exports: [CoreTemplatingService],
})
export class CoreTemplatingModule {}
