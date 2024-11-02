import { Module } from '@nestjs/common';
import { VeeamModule } from './veeam/veeam.module';
import { WinImagingService } from './winPe/imaging.service';
import { WinCapturingService } from './winPe/capturing.service';
import { TFTPModule } from './tftp/tftp.module';
import { WinPeModule } from './winPe/winPe.module';

@Module({
    imports: [VeeamModule, TFTPModule, WinPeModule],
    controllers: [],
    providers: [],
})
export class PXEModule {}