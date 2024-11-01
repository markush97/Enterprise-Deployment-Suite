import { Module } from '@nestjs/common';
import { TFTPService } from './tftp.service';
import { TFTPConfigService } from './tftp.config.service';

@Module({
  imports: [],
  controllers: [],
  providers: [TFTPService, TFTPConfigService],
})
export class TFTPModule {}
