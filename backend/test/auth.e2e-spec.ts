import * as request from 'supertest';

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '../src/app.module';
import { setupApp } from '../src/main';
import {
  getExpiredJwt,
  getInvalidJwt,
  getMalformedJwt,
  getValidJwt,
} from './testutils/auth.testutil';
import { setupTestConfig } from './testutils/setup.testutil';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    setupTestConfig();

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    // Set test JWT secret and any other env overrides BEFORE app setup
    await setupApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/validate (POST) - no token', async () => {
    return request(app.getHttpServer()).post('/auth/validate').expect(401);
  });

  it('/auth/validate (POST) - valid JWT', async () => {
    const token = await getValidJwt();
    console.error(token);
    return request(app.getHttpServer())
      .post('/auth/validate')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('/auth/validate (POST) - invalid JWT', async () => {
    const token = await getInvalidJwt();
    return request(app.getHttpServer())
      .post('/auth/validate')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);
  });

  it('/auth/validate (POST) - malformed JWT', async () => {
    const token = getMalformedJwt();
    return request(app.getHttpServer())
      .post('/auth/validate')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);
  });

  it('/auth/validate (POST) - expired JWT', async () => {
    const token = await getExpiredJwt();
    return request(app.getHttpServer())
      .post('/auth/validate')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);
  });

  it('/auth/self (GET) - valid JWT', async () => {
    const token = await getValidJwt();
    return request(app.getHttpServer())
      .get('/auth/self')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('/auth/self (GET) - no token', async () => {
    return request(app.getHttpServer()).get('/auth/self').expect(401);
  });

  it('/auth/self (GET) - expired JWT', async () => {
    const token = await getExpiredJwt();
    return request(app.getHttpServer())
      .get('/auth/self')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);
  });
});
