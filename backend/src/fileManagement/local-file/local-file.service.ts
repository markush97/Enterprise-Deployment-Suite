import { Injectable } from '@nestjs/common';

import { EntityRepository } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';

import { LocalFileMetadataEntity } from './local-file-metadata.entity';
import { LocalFileDto } from './local-file.dto';

@Injectable()
export class LocalFileService {
  constructor(
    @InjectRepository(LocalFileMetadataEntity)
    private readonly localFilesRepository: EntityRepository<LocalFileMetadataEntity>,
    private readonly em: EntityManager,
  ) {}

  async createFileMetadata(fileData: LocalFileDto): Promise<LocalFileMetadataEntity> {
    const newFile = this.localFilesRepository.create(fileData);
    await this.em.persistAndFlush(newFile);

    return newFile;
  }
}
