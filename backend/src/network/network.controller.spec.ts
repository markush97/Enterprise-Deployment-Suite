import { Test, TestingModule } from '@nestjs/testing';
import { NetworkController } from './network.controller';
import { NetworkService } from './network.service';
import { DHCPService } from './dhcp/dhcp.service';

describe('NetworkController', () => {
    let controller: NetworkController;
    let networkService: NetworkService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [NetworkController],
            providers: [
                {
                    provide: NetworkService,
                    useValue: {
                        findAll: jest.fn().mockResolvedValue([]),
                        findOne: jest.fn().mockResolvedValue({ id: '1' }),
                        create: jest.fn().mockResolvedValue({ id: '1' }),
                        update: jest.fn().mockResolvedValue({ id: '1' }),
                        remove: jest.fn().mockResolvedValue(undefined),
                    },
                },
                {
                    provide: DHCPService,
                    useValue: {
                        getDHCPStatus: jest.fn().mockResolvedValue({ enabled: true }),
                        getDHCPLeases: jest.fn().mockResolvedValue([]),
                        getDHCPConfig: jest.fn().mockResolvedValue({}),

                    }
                }
            ]
        }).compile();

        controller = module.get<NetworkController>(NetworkController);
        networkService = module.get<NetworkService>(NetworkService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
