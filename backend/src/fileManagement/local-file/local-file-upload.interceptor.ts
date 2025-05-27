import { join } from 'path';

import { Injectable, NestInterceptor, Type, mixin } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { FileManagementConfigService } from '../file-management.config.service';

interface LocalFilesInterceptorOptions {
  fieldName: string;
  path?: string;
}

export function LocalFileUploadInterceptor(
  options: LocalFilesInterceptorOptions,
): Type<NestInterceptor> {
  @Injectable()
  class Interceptor implements NestInterceptor {
    fileInterceptor: NestInterceptor;
    constructor(private readonly fileConfig: FileManagementConfigService) {
      const multerOptions = {
        ...fileConfig.createMulterOptions(),
        dest: join(fileConfig.uploadPath, options.path),
      };
      this.fileInterceptor = new (FileInterceptor(options.fieldName, multerOptions))();
    }

    intercept(...args: Parameters<NestInterceptor['intercept']>) {
      return this.fileInterceptor.intercept(...args);
    }
  }
  return mixin(Interceptor);
}
