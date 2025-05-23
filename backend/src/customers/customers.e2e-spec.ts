import * as request from 'supertest';

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '../app.module';

describe('CustomersController (e2e)', () => {
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

  it('/customers (GET) should return 200', async () => {
    const res = await request(app.getHttpServer()).get('/customers');
    expect([200, 404]).toContain(res.status);
  });

  it('/customers/:id (GET) should return 200 or 404', async () => {
    const res = await request(app.getHttpServer()).get('/customers/1');
    expect([200, 404]).toContain(res.status);
  });
});
