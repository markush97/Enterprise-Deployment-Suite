import { AccountEntity, UserRole } from 'src/auth/entities/account.entity';
import { REFRESH_TOKEN_COOKIE_NAME } from 'src/auth/strategies/refreshtoken/refresh-token.entity';
import { TOKEN_LIFESPAN } from 'src/auth/strategies/refreshtoken/refreshtoken.service';
import * as request from 'supertest';

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { EntityManager } from '@mikro-orm/core';

import { AppModule } from '../src/app.module';
import { setupApp } from '../src/main';
import {
  TOKEN_PAYLOAD_VALID,
  getExpiredJwt,
  getInvalidJwt,
  getMalformedJwt,
  getValidJwt,
  testEndpointAuth,
  validateJwt,
} from './testutils/auth.testutil';
import { setupTestConfig } from './testutils/setup.testutil';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let mockAccountRepository: Record<string, jest.Mock>;
  let mockRefreshTokenRepository: Record<string, jest.Mock>;

  beforeAll(async () => {
    setupTestConfig();

    mockAccountRepository = {
      findOne: jest.fn(),
      findOneOrFail: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    };

    mockRefreshTokenRepository = {
      findOne: jest.fn(),
      findOneOrFail: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      nativeDelete: jest.fn(),
      find: jest.fn(),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('AccountEntityRepository')
      .useValue(mockAccountRepository)
      .overrideProvider('RefreshTokenEntityRepository')
      .useValue(mockRefreshTokenRepository)
      .compile();

    app = moduleRef.createNestApplication();
    await setupApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    jest.resetAllMocks();
  });

  describe('/auth (GET)', () => {
    testEndpointAuth('/auth', 'GET', () => app);

    it('should return all accounts', async () => {
      const mockAccounts = [
        { id: 1, email: 'test@example.com' },
        { id: 2, email: 'test2@example.com' },
      ];

      mockAccountRepository.findAll.mockResolvedValue(mockAccounts);

      const token = await getValidJwt();

      await request(app.getHttpServer())
        .get('/auth')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect(res => {
          expect(res.body).toEqual(mockAccounts);
        });

      expect(mockAccountRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('/auth/refresh (GET)', () => {
    testEndpointAuth('/auth/refresh', 'GET', () => app);

    it('should return all refreshTokens', async () => {
      const dateNow = `${new Date()}`;
      const mockTokens = [
        {
          id: '6286bf6e-b515-40ba-8877-0179f26fccd5',
          token: 'token1',
          createdAt: dateNow,
          updatedAt: dateNow,
          lastUsedAt: null,
        },
        {
          id: '7ced7fbd-d52b-4dbe-9505-cc81cb15b189',
          token: 'token2',
          createdAt: dateNow,
          updatedAt: dateNow,
          lastUsedAt: null,
        },
      ];

      mockRefreshTokenRepository.find.mockResolvedValue(mockTokens);

      const token = await getValidJwt();

      await request(app.getHttpServer())
        .get('/auth/refresh')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect(res => {
          expect(res.body).toEqual(mockTokens);
        });

      expect(mockRefreshTokenRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('/auth/validate (POST)', () => {
    it('should fail with no token', async () => {
      return request(app.getHttpServer()).post('/auth/validate').expect(401);
    });

    it('should succeed with valid JWT', async () => {
      const token = await getValidJwt();
      return request(app.getHttpServer())
        .post('/auth/validate')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('should fail with invalid JWT', async () => {
      const token = await getInvalidJwt();
      return request(app.getHttpServer())
        .post('/auth/validate')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);
    });

    it('should fail with malformed JWT', async () => {
      const token = getMalformedJwt();
      return request(app.getHttpServer())
        .post('/auth/validate')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);
    });

    it('should fail with expired JWT', async () => {
      const token = await getExpiredJwt();
      return request(app.getHttpServer())
        .post('/auth/validate')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);
    });
  });

  describe('/auth/self (GET)', () => {
    testEndpointAuth('/auth/self', 'GET', () => app);
    it('should return own account with valid JWT', async () => {
      const token = await getValidJwt();

      const mockAccount = {
        id: '123',
        email: 'test@example.com',
      };

      mockAccountRepository.findOneOrFail.mockResolvedValue(mockAccount);

      await request(app.getHttpServer())
        .get('/auth/self')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect(mockAccount);

      expect(mockAccountRepository.findOneOrFail).toHaveBeenCalledWith(TOKEN_PAYLOAD_VALID.sub);
    });
  });

  describe('/auth/refresh (POST)', () => {
    it('should return 404 without refresh-token-cookie', async () => {
      await request(app.getHttpServer()).post('/auth/refresh').expect(401);
    });

    it('should login the user and return accessToken with valid refresh token', async () => {
      const mockAccount = {
        id: '123',
        email: 'test@example.com',
        updatedAt: new Date(),
        createdAt: new Date(),
        lastLogin: null,
        role: UserRole.ADMINISTRATOR,
      } as AccountEntity;

      const token = 'valid-refresh-token';
      const testRefreshToken = {
        id: '6286bf6e-b515-40ba-8877-0179f26fccd5',
        account: mockAccount,
        token: token,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastUsedAt: null,
      };

      mockRefreshTokenRepository.findOne.mockResolvedValue(testRefreshToken);
      const em = app.get(EntityManager);
      const mockPersistAndFlush = jest.spyOn(em, 'persistAndFlush').mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', `${REFRESH_TOKEN_COOKIE_NAME}=${token}`)
        .expect(200)
        .expect(res => {
          const body = res.body;
          expect(body.id).toEqual(mockAccount.id);
          expect(body.email).toEqual(mockAccount.email);
          expect(body.sub).toEqual(mockAccount.id);
          expect(validateJwt(body.accessToken)).toBeTruthy();
        });

      expect(mockPersistAndFlush).toHaveBeenCalledTimes(2);
      expect(mockRefreshTokenRepository.findOne).toHaveBeenCalledWith(
        { token: token },
        { populate: ['account'] },
      );
      expect(mockRefreshTokenRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockAccountRepository.findOneOrFail).toHaveBeenCalledTimes(0);
      expect(testRefreshToken.lastUsedAt).toBeTruthy();
      expect(mockAccount.lastLogin).toBeTruthy();
    });

    it('should reject refresh if the refreshToken is expired', async () => {
      const token = 'valid-refresh-token';
      const testRefreshToken = {
        id: '6286bf6e-b515-40ba-8877-0179f26fccd5',
        token: token,
        createdAt: new Date(Date.now() - TOKEN_LIFESPAN),
        updatedAt: new Date(),
        lastUsedAt: null,
      };

      mockRefreshTokenRepository.findOne.mockResolvedValue(testRefreshToken);

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', `${REFRESH_TOKEN_COOKIE_NAME}=${token}`)
        .expect(401);

      expect(mockRefreshTokenRepository.findOne).toHaveBeenCalledWith(
        { token: token },
        { populate: ['account'] },
      );
      expect(mockRefreshTokenRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockAccountRepository.findOneOrFail).toHaveBeenCalledTimes(0);
    });

    it('should reject refresh if the refreshToken is wrong', async () => {
      const token = 'valid-refresh-token';
      mockRefreshTokenRepository.findOne.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', `${REFRESH_TOKEN_COOKIE_NAME}=${token}`)
        .expect(401);

      expect(mockRefreshTokenRepository.findOne).toHaveBeenCalledWith(
        { token: token },
        { populate: ['account'] },
      );
      expect(mockRefreshTokenRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockAccountRepository.findOneOrFail).toHaveBeenCalledTimes(0);
    });

    it('should reject refresh if the refreshToken is malformed', async () => {
      const token = 'valid-refresh-token';
      mockRefreshTokenRepository.findOne.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', `${token}`)
        .expect(401);

      expect(mockRefreshTokenRepository.findOne).toHaveBeenCalledWith(
        { token: token },
        { populate: ['account'] },
      );
      expect(mockRefreshTokenRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockAccountRepository.findOneOrFail).toHaveBeenCalledTimes(0);
    });

    it('should reject refresh if the refreshToken is empty', async () => {
      const token = 'valid-refresh-token';
      mockRefreshTokenRepository.findOne.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', `${REFRESH_TOKEN_COOKIE_NAME}=`)
        .expect(401);

      expect(mockRefreshTokenRepository.findOne).toHaveBeenCalledWith(
        { token: token },
        { populate: ['account'] },
      );
      expect(mockRefreshTokenRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockAccountRepository.findOneOrFail).toHaveBeenCalledTimes(0);
    });
  });

  describe('/auth/refresh (DELETE)', () => {
    testEndpointAuth('/auth/refresh', 'DELETE', () => app);

    it('should delete all refresh tokens for the account', async () => {
      await request(app.getHttpServer())
        .delete('/auth/refresh')
        .set('Authorization', `Bearer ${await getValidJwt()}`)
        .expect(200);

      expect(mockRefreshTokenRepository.nativeDelete).toHaveBeenCalledWith({
        account: { id: TOKEN_PAYLOAD_VALID.sub },
      });
    });
  });

  describe('/auth/refresh/:id (DELETE)', () => {
    testEndpointAuth('/auth/refresh/6286bf6e-b515-40ba-8877-0179f26fccd5', 'DELETE', () => app);

    it('should delete a specific refresh token', async () => {
      const tokenId = '6286bf6e-b515-40ba-8877-0179f26fccd5';
      await request(app.getHttpServer())
        .delete(`/auth/refresh/${tokenId}`)
        .set('Authorization', `Bearer ${await getValidJwt()}`)
        .expect(200);

      expect(mockRefreshTokenRepository.nativeDelete).toHaveBeenCalledWith({
        account: { id: TOKEN_PAYLOAD_VALID.sub },
        id: tokenId,
      });
    });
  });
});
