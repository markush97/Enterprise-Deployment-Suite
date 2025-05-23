import { Test, TestingModule } from '@nestjs/testing';
import { NetworkService } from './network.service';
import { DHCPService } from './dhcp/dhcp.service';
import { EntityManager } from '@mikro-orm/core';
import { NetworkConfigService } from './network.config.service';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { NetworkInterfaceEntity } from './entities/network-interface.entity';

describe('NetworkService', () => {
    let service: NetworkService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NetworkService,
                { provide: 'NetworkRepository', useValue: { findAll: jest.fn(), findOne: jest.fn() } },
                { provide: DHCPService, useValue: { getDHCPStatus: jest.fn() } },
                { provide: EntityManager, useValue: { persistAndFlush: jest.fn() } },
                { provide: NetworkConfigService, useValue: {} },
                { provide: getRepositoryToken(NetworkInterfaceEntity), useValue: {}, }
            ],
        }).compile();

        service = module.get<NetworkService>(NetworkService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

});
