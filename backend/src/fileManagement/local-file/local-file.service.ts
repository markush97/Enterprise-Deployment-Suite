import * as archiver from 'archiver';
import { createReadStream } from 'fs';
import { readdir, rm, stat } from 'fs/promises';
import { isAbsolute, join, normalize, resolve } from 'path';
import { BadRequestMTIException } from 'src/core/errorhandling/exceptions/bad-request.mti-exception';
import { InternalMTIException } from 'src/core/errorhandling/exceptions/internal.mti-exception';
import { MTIErrorCodes } from 'src/core/errorhandling/exceptions/mti.error-codes.enum';
import * as unzipper from 'unzipper';

import { Injectable, Logger } from '@nestjs/common';

import { EntityRepository } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';

import { FileManagementConfigService } from '../file-management.config.service';
import { FileOverviewDto } from './file-overview.dto';
import { LocalFileMetadataEntity } from './local-file-metadata.entity';
import { LocalFileDto } from './local-file.dto';

@Injectable()
export class LocalFileService {
  private readonly logger = new Logger('LocalFileService');
  constructor(
    @InjectRepository(LocalFileMetadataEntity)
    private readonly localFilesRepository: EntityRepository<LocalFileMetadataEntity>,
    private readonly em: EntityManager,
    private readonly fileConfigService: FileManagementConfigService,
  ) {}

  async createFileMetadata(fileData: LocalFileDto): Promise<LocalFileMetadataEntity> {
    const newFile = this.localFilesRepository.create(fileData);
    await this.em.persistAndFlush(newFile);

    return newFile;
  }

  public async getFileAsArchive(fileInfo: LocalFileMetadataEntity): Promise<archiver.Archiver> {
    this.logger.debug(`Getting file as archive: ${fileInfo.filename}`);

    const filePath = resolve(this.fileConfigService.uploadPath, fileInfo.path, fileInfo.filename);

    await stat(filePath).catch(error => {
      this.logger.error(`Error reading file ${fileInfo.id}: ${error.message}`);
      throw new InternalMTIException(MTIErrorCodes.FILE_READING_ERROR, `Error reading file!`);
    });

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.directory(filePath, false);
    archive.on('error', err => {
      this.logger.error(
        `Error while creating archive for file-content ${fileInfo.id}: ${err.message}`,
      );
      throw new InternalMTIException(
        MTIErrorCodes.ARCHIVE_CREATION_ERROR,
        `Error while creating archive for download.`,
      );
    });

    return archive;
  }

  public async getFilesAsArchive(
    fileInfos: (LocalFileMetadataEntity & { zipFolderName: string })[],
  ): Promise<archiver.Archiver> {
    this.logger.debug(`Getting files as archive for ${fileInfos.length} files`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', err => {
      this.logger.error(`Error while creating archive for file-content: ${err.message}`);
      throw new InternalMTIException(
        MTIErrorCodes.ARCHIVE_CREATION_ERROR,
        `Error while creating archive for download.`,
      );
    });

    for (const fileInfo of fileInfos) {
      const filePath = resolve(this.fileConfigService.uploadPath, fileInfo.path, fileInfo.filename);

      await stat(filePath).catch(error => {
        this.logger.error(`Error reading file ${fileInfo.id}: ${error.message}`);
        throw new InternalMTIException(MTIErrorCodes.FILE_READING_ERROR, `Error reading file!`);
      });

      archive.directory(filePath, join(fileInfo.zipFolderName, fileInfo.filename));
    }

    return archive;
  }

  public async saveUnpackedArchive(
    fileBuffer: Buffer,
    path: string,
  ): Promise<LocalFileMetadataEntity> {
    await this.deleteFileByPath(path);

    const destPath = resolve(this.fileConfigService.uploadPath, path);
    const pathParts = path.split('/');
    const directory = pathParts.slice(0, pathParts.length - 1).join('/');
    const folderName = pathParts[pathParts.length - 1];

    const zip = await unzipper.Open.buffer(fileBuffer);
    await this.validateZipNoTraversal(zip, destPath);

    await zip.extract({ path: destPath, concurrency: 5 }).catch(error => {
      this.logger.error(`Error unpacking archive: ${error.message}`);
      throw new InternalMTIException(
        MTIErrorCodes.ARCHIVE_UNPACKING_FAILED,
        `Error unpacking and saving archive`,
      );
    });

    return await this.createFileMetadata({
      filename: folderName,
      path: directory,
      mimetype: 'inode/directory',
      isFolder: true,
    });
  }

  public async deleteFile(fileInfo: LocalFileMetadataEntity): Promise<void> {
    this.logger.debug(`Deleting file: ${fileInfo.filename}`);

    const filePath = resolve(this.fileConfigService.uploadPath, fileInfo.path, fileInfo.filename);

    try {
      await rm(filePath, { recursive: true });
      await this.em.removeAndFlush(fileInfo);
    } catch (error) {
      // Only throw if error is not "ENOENT" (folder does not exist)
      if (error.code !== 'ENOENT') {
        this.logger.error(`Error deleting existing folder at ${filePath}: ${error.message}`);
        throw new InternalMTIException(
          MTIErrorCodes.FILE_DELETION_ERROR,
          `Error deleting existing folder at destination path`,
        );
      }
    }
  }

  public async deleteFileByPath(filePath: string): Promise<void> {
    this.logger.debug(`Deleting file or folder by path: ${filePath}`);

    const file = await this.getFileByPath(filePath);
    if (!file) {
      return;
    }

    await this.deleteFile(file);
  }

  /**
   * Returns a list of files (with name and size) in the given directory.
   */
  async getFilesOverview(fileMetadata: LocalFileMetadataEntity): Promise<FileOverviewDto> {
    const fullPath = join(
      this.fileConfigService.uploadPath,
      fileMetadata.path,
      fileMetadata.filename,
    );
    this.logger.debug(`Getting files in directory: ${fullPath}`);

    return this.getFileInfo(fullPath);
  }

  private async getFileInfo(filePath: string): Promise<FileOverviewDto | null> {
    const stats = await stat(filePath);
    if (!stats) {
      return null;
    }

    if (stats.isDirectory()) {
      const children = await readdir(filePath, { withFileTypes: true });
      const childFiles = await Promise.all(
        children.map(child => this.getFileInfo(join(filePath, child.name))),
      );
      return {
        name: filePath.split('/').pop(),
        fileSize: 0,
        fileType: 'directory',
        children: childFiles.filter(child => child !== null) as FileOverviewDto[],
      };
    }

    return {
      name: filePath.split('/').pop(),
      fileSize: stats.size,
      fileType: 'file',
      children: null,
    };
  }

  private async getFileByPath(filePath: string): Promise<LocalFileMetadataEntity | null> {
    this.logger.debug(`Getting file or folder by path: ${filePath}`);

    const pathParts = filePath.split('/');
    const directory = pathParts.slice(0, pathParts.length - 1).join('/');
    const folderName = pathParts[pathParts.length - 1];

    const file = await this.localFilesRepository.findOne({ path: directory, filename: folderName });
    if (!file) {
      this.logger.debug(`File not found for path: ${filePath}`);
      return null;
    }

    return file;
  }

  private async validateZipNoTraversal(zip: unzipper.CentralDirectory, targetDir: string) {
    for (const entry of zip.files) {
      const entryPath = entry.path;
      // Forbid absolute paths and traversal
      if (
        entryPath.includes('..') ||
        isAbsolute(entryPath) ||
        entryPath.startsWith('/') ||
        entryPath.startsWith('\\')
      ) {
        throw new BadRequestMTIException(
          MTIErrorCodes.ZIP_WITH_PATH_TRAVERSAL,
          'Zip contains forbidden path: ' + entryPath,
        );
      }
      // Forbid escaping the target directory
      const destPath = normalize(join(targetDir, entryPath));
      if (!destPath.startsWith(resolve(targetDir))) {
        throw new BadRequestMTIException(
          MTIErrorCodes.ZIP_WITH_PATH_TRAVERSAL,
          'Zip contains forbidden path: ' + entryPath,
        );
      }
    }
  }
}
