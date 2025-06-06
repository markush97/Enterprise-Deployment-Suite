import * as fs from 'fs/promises';
import * as path from 'path';

import { Injectable, NotFoundException } from '@nestjs/common';

import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';

import { CreateImageDto } from './dto/create-image.dto';
import { ImageEntity } from './entities/image.entity';

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(ImageEntity)
    private readonly imageRepository: EntityRepository<ImageEntity>,
    private readonly em: EntityManager,
  ) {}

  async findAll(): Promise<ImageEntity[]> {
    return this.imageRepository.findAll();
  }

  async findOne(id: string): Promise<ImageEntity> {
    const image = await this.imageRepository.findOne(id);
    if (!image) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }
    return image;
  }

  async create(createImageDto: CreateImageDto, file?): Promise<ImageEntity> {
    let imagePath = createImageDto.imagePath;

    if (file) {
      // Create images directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), 'uploads', 'images');
      await fs.mkdir(uploadDir, { recursive: true });

      // Save file
      const fileName = `${Date.now()}-${file.originalname}`;
      imagePath = path.join('uploads', 'images', fileName);
      await fs.writeFile(path.join(process.cwd(), imagePath), file.buffer);
    }

    const image = this.imageRepository.create({
      ...createImageDto,
      imagePath,
      size: file?.size || 0,
    });

    await this.em.persistAndFlush(image);
    return image;
  }

  async update(id: string, updateImageDto: Partial<CreateImageDto>): Promise<ImageEntity> {
    const image = await this.findOne(id);
    this.imageRepository.assign(image, updateImageDto);
    await this.em.flush();
    return image;
  }

  async remove(id: string): Promise<void> {
    const image = await this.findOne(id);

    // Delete file if it exists
    if (image.imagePath) {
      try {
        await fs.unlink(path.join(process.cwd(), image.imagePath));
      } catch {
        // Ignore file not found errors
      }
    }

    await this.em.removeAndFlush(image);
  }
}
