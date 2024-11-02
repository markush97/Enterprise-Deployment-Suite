import { Module } from '@nestjs/common';
import { WinImagingService } from './imaging.service';
import { WinCapturingService } from './capturing.service';
import { WinPeConfigService } from './winPe.config.service';

@Module({
    controllers: [],
    providers: [WinImagingService, WinCapturingService,WinPeConfigService],
})
export class WinPeModule {};