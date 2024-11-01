import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WinPeConfigService {
    constructor(private readonly configService: ConfigService) {}
    
    get captureDirectory(): string {
        return this.configService.get<string>('WINPE_CAPTURE_DIR', '/tmp/captures')
    }

    get 
}