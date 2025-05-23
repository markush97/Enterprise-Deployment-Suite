import { CustomersService } from 'src/customers/customers.service';
import { ITGlueService } from 'src/integrations/itglue/itglue.service';

import { Test, TestingModule } from '@nestjs/testing';

import { EntityManager } from '@mikro-orm/core';
import { getRepositoryToken } from '@mikro-orm/nestjs';

import { DevicesService } from './devices.service';
import { DeviceEntity } from './entities/device.entity';

jest.mock('../core/utils/crypto.helper', () => ({
  generateSecureRandomUUID: () => 'test-uuid',
}));

describe('DevicesService', () => {
  let service: DevicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DevicesService,
        {
          provide: getRepositoryToken(DeviceEntity),
          useValue: { findAll: jest.fn(), findOne: jest.fn() },
        },
        { provide: EntityManager, useValue: { persistAndFlush: jest.fn() } },
        { provide: CustomersService, useValue: { findAll: jest.fn(), findOne: jest.fn() } },
        { provide: ITGlueService, useValue: {} },
      ],
    }).compile();

    service = module.get<DevicesService>(DevicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call findAll on deviceRepository', async () => {
    const deviceRepository = (service as any).deviceRepository;
    deviceRepository.findAll.mockResolvedValue([]);
    const result = await service.findAll();
    expect(result).toEqual([]);
    expect(deviceRepository.findAll).toHaveBeenCalled();
  });
});
