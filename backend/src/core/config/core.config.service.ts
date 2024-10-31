import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type ProcessEnvs = 'development' | 'test' | 'production' | 'staging';

/**
 * Provider for some basic, widely used configurations
 */
@Injectable()
export class CoreConfigService {
    constructor(private readonly config: ConfigService) { }

    /**
     * Process environment this is app is currently running in.
     * Defaults to production
     */
    public get processEnv(): ProcessEnvs {
        return this.config.get<ProcessEnvs>('PROCESS_ENV', 'production');
    }

    /**
     * Path Prefix used for the api
     */
    public get globalPrefix(): string {
        return this.config.get<string>('API_PATH_PREFIX', 'api');
    }

    /**
     * HTTP Port the API is listening on
     */
    public get httpsPort(): number {
        return this.config.get<number>('API_PORT', 3333)
    }

}
