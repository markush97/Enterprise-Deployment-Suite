import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { ITGlueConfigService } from './itglue.config.service';
import { ITGlueService } from './itglue.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [],
      useClass: ITGlueConfigService,
    }),
  ],
  controllers: [],
  providers: [ITGlueService, ITGlueConfigService],
  exports: [ITGlueService],
})
export class ITGlueModule {}
