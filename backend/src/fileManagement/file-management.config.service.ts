import * as multer from 'multer';
import { CoreConfigService } from 'src/core/config/core.config.service';

import { Injectable } from '@nestjs/common';
import { MulterModuleOptions, MulterOptionsFactory } from '@nestjs/platform-express';
import { ServeStaticModuleOptions, ServeStaticModuleOptionsFactory } from '@nestjs/serve-static';

export const ARCHIVE_FILE_MIME_TYPES_REGEXP: RegExp =
  /^(application\/(vnd\.rar|x-rar-compressed|zip|x-zip-compressed|octet-stream)|multipart\/x-zip)$/i;

@Injectable()
export class FileManagementConfigService
  implements ServeStaticModuleOptionsFactory, MulterOptionsFactory
{
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

  createMulterOptions(): MulterModuleOptions {
    return {
      dest: this.uploadPath,
      storage: multer.memoryStorage(),
    };
  }

  public get staticPath(): string {
    return this.config.get<string>('STATIC_RESOURCES', '/srv/eds/static');
  }

  public get uploadPath(): string {
    return this.config.get<string>('FILE_UPLOAD_PATH', '/srv/eds/upload');
  }

  /**
   * Max upload size in Bytes
   * @default 1MB
   */
  public get maxUploadSize(): number {
    return this.config.get<number>('FILE_UPLOAD_MAX_SIZE_MB', 10) * 1024 * 1024;
  }
}
