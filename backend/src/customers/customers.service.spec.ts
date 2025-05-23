import { Test, TestingModule } from '@nestjs/testing';

import { EntityManager } from '@mikro-orm/core';
import { getRepositoryToken } from '@mikro-orm/nestjs';

import { CustomersService } from './customers.service';
import { CustomerEntity } from './entities/customer.entity';

jest.mock('../core/utils/crypto.helper', () => ({
  generateSecureRandomUUID: () => 'test-uuid',
}));

describe('CustomersService', () => {
  let service: CustomersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        {
          provide: getRepositoryToken(CustomerEntity),
          useValue: { findAll: jest.fn(), findOne: jest.fn() },
        },
        { provide: EntityManager, useValue: { persistAndFlush: jest.fn() } },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call findAll on customerRepository', async () => {
    const customerRepository = (service as any).customerRepository;
    customerRepository.findAll.mockResolvedValue([]);
    const result = await service.findAll();
    expect(result).toEqual([]);
    expect(customerRepository.findAll).toHaveBeenCalled();
  });
});
