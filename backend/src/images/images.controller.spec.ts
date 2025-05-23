import { Test, TestingModule } from '@nestjs/testing';

import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';

jest.mock('../core/utils/crypto.helper', () => ({
  generateSecureRandomUUID: () => 'test-uuid',
}));

describe('ImagesController', () => {
  let controller: ImagesController;
  let imagesService: ImagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImagesController],
      providers: [
        {
          provide: ImagesService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([]),
            findOne: jest.fn().mockResolvedValue({ id: '1' }),
            create: jest.fn().mockResolvedValue({ id: '1' }),
            update: jest.fn().mockResolvedValue({ id: '1' }),
            remove: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    controller = module.get<ImagesController>(ImagesController);
    imagesService = module.get<ImagesService>(ImagesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get all images', async () => {
    expect(await controller.findAll()).toEqual([]);
    expect(imagesService.findAll).toHaveBeenCalled();
  });

  it('should get an image by id', async () => {
    expect(await controller.findOne('1')).toEqual({ id: '1' });
    expect(imagesService.findOne).toHaveBeenCalledWith('1');
  });
});
