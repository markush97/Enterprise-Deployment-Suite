import { Test, TestingModule } from '@nestjs/testing';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';

jest.mock('../core/utils/crypto.helper', () => ({
  generateSecureRandomUUID: () => 'test-uuid',
}));

describe('DevicesController', () => {
  let controller: DevicesController;
  let devicesService: DevicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DevicesController],
      providers: [
        {
          provide: DevicesService,
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

    controller = module.get<DevicesController>(DevicesController);
    devicesService = module.get<DevicesService>(DevicesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get all devices', async () => {
    expect(await controller.findAll()).toEqual([]);
    expect(devicesService.findAll).toHaveBeenCalled();
  });

  it('should get a device by id', async () => {
    expect(await controller.findOne('1')).toEqual({ id: '1' });
    expect(devicesService.findOne).toHaveBeenCalledWith('1');
  });
});
