import * as request from 'supertest';

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '../app.module';

describe('DevicesController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/devices (GET) should return 200', async () => {
    const res = await request(app.getHttpServer()).get('/devices');
    expect(res.status).toBe(200);
    // Optionally check response body structure
  });

  it('/devices/:id (GET) should return 200 or 404', async () => {
    const res = await request(app.getHttpServer()).get('/devices/1');
    // Accept 200 or 404 depending on test DB state
    expect([200, 404]).toContain(res.status);
  });
});
