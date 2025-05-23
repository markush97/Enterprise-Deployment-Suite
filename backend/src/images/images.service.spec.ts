import { Test, TestingModule } from '@nestjs/testing';
import { ImagesService } from './images.service';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { ImageEntity } from './entities/image.entity';
import { EntityManager } from '@mikro-orm/core';

jest.mock('../core/utils/crypto.helper', () => ({
  generateSecureRandomUUID: () => 'test-uuid'
}));

describe('ImagesService', () => {
  let service: ImagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImagesService,
        { provide: getRepositoryToken(ImageEntity), useValue: { findAll: jest.fn(), findOne: jest.fn() } },
        { provide: EntityManager, useValue: { persistAndFlush: jest.fn() } },
      ],
    }).compile();

    service = module.get<ImagesService>(ImagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call findAll on imageRepository', async () => {
    const imageRepository = (service as any).imageRepository;
    imageRepository.findAll.mockResolvedValue([]);
    const result = await service.findAll();
    expect(result).toEqual([]);
    expect(imageRepository.findAll).toHaveBeenCalled();
  });
});
