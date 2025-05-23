import { CoreConfigService } from 'src/core/config/core.config.service';

import { Injectable } from '@nestjs/common';
import { ServeStaticModuleOptions, ServeStaticModuleOptionsFactory } from '@nestjs/serve-static';

@Injectable()
export class StaticFileConfigService implements ServeStaticModuleOptionsFactory {
  constructor(private readonly config: CoreConfigService) {}

  createLoggerOptions(): ServeStaticModuleOptions[] {
    return [
      {
        rootPath: this.staticPath,
        serveRoot: '/static',
        serveStaticOptions: {
          index: false,
          fallthrough: false,
        },
      },
    ];
  }

  public get staticPath(): string {
    return this.config.get<string>('STATIC_RESOURCES', '/srv/static');
  }
}
