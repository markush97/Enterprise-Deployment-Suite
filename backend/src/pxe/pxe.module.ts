import { Module } from '@nestjs/common';

import { TFTPModule } from './tftp/tftp.module';
import { VeeamModule } from './veeam/veeam.module';
import { WinPeModule } from './winPe/winPe.module';

@Module({
  imports: [VeeamModule, TFTPModule, WinPeModule],
  controllers: [],
  providers: [],
})
export class PXEModule {}
