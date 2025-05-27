import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';

import { MikroOrmModule } from '@mikro-orm/nestjs';

import { FileManagementConfigService } from './file-management.config.service';
import { LocalFileMetadataEntity } from './local-file/local-file-metadata.entity';
import { LocalFileService } from './local-file/local-file.service';

@Module({
  imports: [
    ServeStaticModule.forRootAsync({ useClass: FileManagementConfigService }),
    MikroOrmModule.forFeature([LocalFileMetadataEntity]),
  ],
  controllers: [],
  providers: [FileManagementConfigService, LocalFileService],
  exports: [LocalFileService, FileManagementConfigService],
})
export class FileManagementModule {}
