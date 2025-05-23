import { CoreConfigModule } from 'src/core/config/core.config.module';
import { CoreConfigService } from 'src/core/config/core.config.service';

import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

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
