import { Test, TestingModule } from '@nestjs/testing';
import { VpnService } from './vpn.service';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/core';
import { CustomersService } from 'src/customers/customers.service';

describe('VpnService', () => {
  let service: VpnService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VpnService,
        { provide: getRepositoryToken('VpnProfile'), useValue: { findAll: jest.fn(), findOne: jest.fn() } },
        { provide: EntityManager, useValue: { persistAndFlush: jest.fn() } },
        { provide: CustomersService, useValue: { getCustomerById: jest.fn() } },
      ],
    }).compile();

    service = module.get<VpnService>(VpnService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call findAll on vpnRepository', async () => {
    const vpnRepository = (service as any).vpnRepository;
    vpnRepository.findAll.mockResolvedValue([]);
    const result = await service.findAll();
    expect(result).toEqual([]);
    expect(vpnRepository.findAll).toHaveBeenCalled();
  });
});
