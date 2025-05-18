import { HttpModuleOptions } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { CoreConfigService } from 'src/core/config/core.config.service';


@Injectable()
export class ITGlueConfigService {
    constructor(private readonly config: CoreConfigService) {
    }

    createHttpOptions(): HttpModuleOptions {
        return {
            baseURL: this.apiUrl,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'x-api-key': this.apiKey
            }
        };
    }

    get apiKey(): string {
        return this.config.get<string>('ITGLUE_API_KEY', '');
    }

    get apiUrl(): string {
        return this.config.get<string>('ITGLUE_API_URL', 'https://api.eu.itglue.com');
    }
}



