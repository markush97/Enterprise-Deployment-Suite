import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CoreConfigService } from 'src/core/config/core.config.service';


@Injectable() 
export class DHCPConfigService {
    constructor(private readonly config: CoreConfigService) {
    }    

    get port(): number {
        return this.config.get<number>('DHCP_SERVER_PORT', 67);
    }
}
