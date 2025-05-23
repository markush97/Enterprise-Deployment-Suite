import { Test, TestingModule } from '@nestjs/testing';

import { EntityManager } from '@mikro-orm/core';
import { getRepositoryToken } from '@mikro-orm/nestjs';

import { AuthService } from './auth.service';
import { AccountEntity } from './entities/account.entity';
import { AuthJwtService } from './strategies/jwt/jwt.service';
import { RefreshTokenService } from './strategies/refreshtoken/refreshtoken.service';

describe('AuthService', () => {
  let service: AuthService;
  let accountRepository: any;
  let em: any;
  let jwtService: any;
  let refreshTokenService: any;

  beforeEach(async () => {
    accountRepository = {
      findOne: jest.fn(),
      findOneOrFail: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
    };
    jwtService = { signUser: jest.fn() };
    refreshTokenService = { getAccountByToken: jest.fn() };
    em = { persistAndFlush: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(AccountEntity), useValue: accountRepository },
        { provide: EntityManager, useValue: em },
        { provide: AuthJwtService, useValue: jwtService },
        { provide: RefreshTokenService, useValue: refreshTokenService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should login and return a token', async () => {
      accountRepository.findOneOrFail.mockResolvedValue({ id: '1' });
      em.persistAndFlush.mockResolvedValue(undefined);
      jwtService.signUser.mockResolvedValue('token');
      const result = await service.login('1');
      expect(result).toBe('token');
      expect(accountRepository.findOneOrFail).toHaveBeenCalledWith('1');
      expect(em.persistAndFlush).toHaveBeenCalled();
      expect(jwtService.signUser).toHaveBeenCalled();
    });
    it('should throw if user not found', async () => {
      accountRepository.findOneOrFail.mockRejectedValue(new Error('not found'));
      await expect(service.login('bad')).rejects.toThrow('not found');
    });
  });

  describe('loginEntraUser', () => {
    it('should create and login a new Entra user', async () => {
      accountRepository.findOne.mockResolvedValue(undefined);
      accountRepository.create.mockReturnValue({ id: '2', lastLogin: undefined });
      em.persistAndFlush.mockResolvedValue(undefined);
      jwtService.signUser.mockResolvedValue('entra-token');
      const userInfo = { oid: 'oid', upn: 'mail', name: 'name' };
      const result = await service.loginEntraUser(userInfo as any);
      expect(accountRepository.create).toHaveBeenCalled();
      expect(jwtService.signUser).toHaveBeenCalled();
      expect(result).toBe('entra-token');
    });
    it('should login an existing Entra user', async () => {
      accountRepository.findOne.mockResolvedValue({ id: '3', lastLogin: undefined });
      em.persistAndFlush.mockResolvedValue(undefined);
      jwtService.signUser.mockResolvedValue('entra-token2');
      const userInfo = { oid: 'oid', upn: 'mail', name: 'name' };
      const result = await service.loginEntraUser(userInfo as any);
      expect(accountRepository.create).not.toHaveBeenCalled();
      expect(jwtService.signUser).toHaveBeenCalled();
      expect(result).toBe('entra-token2');
    });
  });

  describe('getOwnAccount', () => {
    it('should return own account', async () => {
      accountRepository.findOne.mockResolvedValue({ id: '1', email: 'test@example.com' });
      const result = await service.getOwnAccount('1');
      expect(result).toEqual({ id: '1', email: 'test@example.com' });
    });
    it('should return null if not found', async () => {
      accountRepository.findOne.mockResolvedValue(null);
      const result = await service.getOwnAccount('notfound');
      expect(result).toBeNull();
    });
  });

  describe('getAccounts', () => {
    it('should return all accounts', async () => {
      accountRepository.findAll.mockResolvedValue([{ id: '1' }, { id: '2' }]);
      const result = await service.getAccounts();
      expect(result).toEqual([{ id: '1' }, { id: '2' }]);
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh access token', async () => {
      refreshTokenService.getAccountByToken.mockResolvedValue({ id: '1' });
      jest.spyOn(service, 'login').mockResolvedValue('new-token' as any);
      const result = await service.refreshAccessToken('refresh-token');
      expect(result).toBe('new-token');
      expect(refreshTokenService.getAccountByToken).toHaveBeenCalledWith('refresh-token');
    });
  });
});
