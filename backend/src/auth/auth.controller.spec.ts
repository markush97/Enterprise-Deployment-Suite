import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshTokenService } from './strategies/refreshtoken/refreshtoken.service';

describe('AuthController', () => {
    let controller: AuthController;
    let authService: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: {
                        getAccounts: jest.fn().mockResolvedValue([{ id: '1', email: 'test@example.com' }]),
                        getOwnAccount: jest.fn().mockResolvedValue({ id: '1', email: 'test@example.com' }),
                    },
                },
                { provide: RefreshTokenService, useValue: {} }
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should get accounts', async () => {
        expect(await controller.getAccounts()).toEqual([{ id: '1', email: 'test@example.com' }]);
    });

    it('should get own account', async () => {
        expect(await controller.getOwnAccount({ sub: '1', login: 'test-login', email: 'test@example.com' })).toEqual({ id: '1', email: 'test@example.com' });
    });
});
