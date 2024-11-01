import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ServeStaticModuleOptions, ServeStaticModuleOptionsFactory } from '@nestjs/serve-static';


@Injectable() 
export class StaticFileConfigService implements ServeStaticModuleOptionsFactory {
    constructor(private readonly config: ConfigService) {
    }

    createLoggerOptions(): ServeStaticModuleOptions[] {
        return [{
            rootPath: this.staticPath,
            serveRoot: '/static',
        }];
    }
    
    public get staticPath(): string {
        return this.config.get<string>('STATIC_RESOURCES', '/srv/static');
    }

}
