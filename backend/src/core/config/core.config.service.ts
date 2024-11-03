import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { hostname } from 'os';

type ProcessEnvs = 'development' | 'test' | 'production' | 'staging';

/**
 * Provider for some basic, widely used configurations
 */
@Injectable()
export class CoreConfigService extends ConfigService{
    /**
     * Process environment this is app is currently running in.
     * Defaults to production
     */
    public get processEnv(): ProcessEnvs {
        return this.get<ProcessEnvs>('PROCESS_ENV', 'production');
    }

    /**
     * Path Prefix used for the api
     */
    public get globalPrefix(): string {
        return this.get<string>('API_PATH_PREFIX', 'api');
    }

    /**
     * HTTP Port the API is listening on
     */
    public get httpsPort(): number {
        return this.get<number>('API_PORT', 3333)
    }

    /**
     * Hostname under which this server is reachable
     */
    public get hostname(): string {
        return this.get<string>('API_HOSTNAME', hostname())
    }

    /**
     * Domain under which this server is reachable (Without the hostname part)
     */
    public get domainName(): string {
        return this.get<string>('API_DOMAINNAME', 'local');
    }

    /**
     * FQDN under which this server is reachable
     */
    public fqdn(): string {
        return `${this.hostname}.${this.domainName}`
    }

}
