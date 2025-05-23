import { Test, TestingModule } from '@nestjs/testing';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';

jest.mock('../core/utils/crypto.helper', () => ({
  generateSecureRandomUUID: () => 'test-uuid',
}));

describe('CustomersController', () => {
  let controller: CustomersController;
  let customersService: CustomersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomersController],
      providers: [
        {
          provide: CustomersService,
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

    controller = module.get<CustomersController>(CustomersController);
    customersService = module.get<CustomersService>(CustomersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get all customers', async () => {
    expect(await controller.findAll()).toEqual([]);
    expect(customersService.findAll).toHaveBeenCalled();
  });

  it('should get a customer by id', async () => {
    expect(await controller.findOne('1')).toEqual({ id: '1' });
    expect(customersService.findOne).toHaveBeenCalledWith('1');
  });
});
