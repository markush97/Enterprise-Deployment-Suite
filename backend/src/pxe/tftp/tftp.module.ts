import { Module } from '@nestjs/common';

import { TFTPConfigService } from './tftp.config.service';
import { TFTPService } from './tftp.service';

@Module({
  imports: [],
  controllers: [],
  providers: [TFTPService, TFTPConfigService],
})
export class TFTPModule {}
