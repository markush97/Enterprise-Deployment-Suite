import * as request from 'supertest';

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '../src/app.module';
import { setupApp } from '../src/main';
import {
  TOKEN_PAYLOAD_VALID,
  getExpiredJwt,
  getInvalidJwt,
  getMalformedJwt,
  getValidJwt,
  testEndpointAuth,
} from './testutils/auth.testutil';
import { setupTestConfig } from './testutils/setup.testutil';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let mockAccountRepository: Record<string, jest.Mock>;
  let mockRefreshTokenService: Record<string, jest.Mock>;

  beforeAll(async () => {
    setupTestConfig();

    mockAccountRepository = {
      findOne: jest.fn(),
      findOneOrFail: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    };

    mockRefreshTokenService = {
      findOne: jest.fn(),
      findOneOrFail: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('AccountEntityRepository')
      .useValue(mockAccountRepository)
      .overrideProvider('RefreshTokenServiceRepository')
      .useValue(mockRefreshTokenService)
      .overrideProvider('EntityManager')
      .useValue({
        persistAndFlush: jest.fn(),
      })
      .compile();

    app = moduleRef.createNestApplication();
    await setupApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth (GET)', () => {
    testEndpointAuth('/auth', 'GET', () => app);

    it('should return all accounts', async () => {
      const mockAccounts = [
        { id: 1, username: 'testuser1', email: 'test@example.com' },
        { id: 2, username: 'testuser2', email: 'test2@example.com' },
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
        username: 'testuser',
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
  });

  testEndpointAuth('/auth/refresh', 'DELETE', () => app);
  testEndpointAuth('/auth/refresh/6286bf6e-b515-40ba-8877-0179f26fccd5', 'DELETE', () => app);
});
