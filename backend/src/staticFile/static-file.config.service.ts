import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ServeStaticModuleOptions, ServeStaticModuleOptionsFactory } from '@nestjs/serve-static';
import { CoreConfigService } from 'src/core/config/core.config.service';


@Injectable() 
export class StaticFileConfigService implements ServeStaticModuleOptionsFactory {
    constructor(private readonly config: CoreConfigService) {
    }

    createLoggerOptions(): ServeStaticModuleOptions[] {
        return [{
            rootPath: this.staticPath,
            serveRoot: '/static',
            serveStaticOptions: {
                index: false,
                fallthrough: false
                
            }
        }];
    }
    
    public get staticPath(): string {
        return this.config.get<string>('STATIC_RESOURCES', '/srv/static');
    }

}
