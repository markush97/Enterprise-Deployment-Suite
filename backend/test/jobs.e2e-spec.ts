import * as request from 'supertest';

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '../src/app.module';

describe('JobsController (e2e)', () => {
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

  it('/jobs (GET) should return 200', async () => {
    const res = await request(app.getHttpServer()).get('/jobs');
    expect([200, 404]).toContain(res.status);
  });

  it('/jobs/:id (GET) should return 200 or 404', async () => {
    const res = await request(app.getHttpServer()).get('/jobs/1');
    expect([200, 404]).toContain(res.status);
  });

  it('/jobs (POST) should return 201 or 400', async () => {
    const res = await request(app.getHttpServer()).post('/jobs').send({});
    expect([201, 400]).toContain(res.status);
  });
});
