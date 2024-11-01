import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';


@Injectable() 
export class TFTPConfigService {
    constructor(private readonly config: ConfigService) {
    }
    
    public get port(): number {
        return this.config.get<number>('TFTP_PORT', 6969);
    }

    public get fileRoot(): string {
        return this.config.get<string>('TFTP_ROOT', '/srv/tftp');
    }

}
