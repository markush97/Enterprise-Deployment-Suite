import { Test, TestingModule } from '@nestjs/testing';

import { VpnController } from './vpn.controller';
import { VpnService } from './vpn.service';

describe('VpnController', () => {
  let controller: VpnController;
  let vpnService: VpnService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VpnController],
      providers: [
        {
          provide: VpnService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([]),
            findOne: jest.fn().mockResolvedValue({ id: '1' }),
            create: jest.fn().mockResolvedValue({ id: '1' }),
            update: jest.fn().mockResolvedValue({ id: '1' }),
            remove: jest.fn().mockResolvedValue(undefined),
            testConnection: jest.fn().mockResolvedValue({ success: true, message: 'ok' }),
          },
        },
      ],
    }).compile();

    controller = module.get<VpnController>(VpnController);
    vpnService = module.get<VpnService>(VpnService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get all VPNs', async () => {
    expect(await controller['findAll']?.()).toEqual([]);
    expect(vpnService.findAll).toHaveBeenCalled();
  });

  it('should get a VPN by id', async () => {
    expect(await controller['findOne']?.('1')).toEqual({ id: '1' });
    expect(vpnService.findOne).toHaveBeenCalledWith('1');
  });

  it('should test VPN connection', async () => {
    expect(await controller.testConnection('1')).toEqual({ success: true, message: 'ok' });
    expect(vpnService.testConnection).toHaveBeenCalledWith('1');
  });
});
