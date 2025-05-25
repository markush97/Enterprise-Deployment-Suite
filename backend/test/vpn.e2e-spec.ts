import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '../src/app.module';
import { setupApp } from '../src/main';
import { testEndpointAuth } from './testutils/auth.testutil';
import { setupTestConfig } from './testutils/setup.testutil';

describe('ImagesController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    setupTestConfig();

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await setupApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/images (GET)', () => {
    testEndpointAuth('/images', 'GET', () => app);
  });
  describe('/images/:id (GET)', () => {
    testEndpointAuth('/images/f7e81f10-2bd7-460f-ba8b-3e90f221a053', 'GET', () => app);
  });
  describe('/images (POST)', () => {
    testEndpointAuth('/images', 'POST', () => app);
  });
  describe('/images/:id (PUT)', () => {
    testEndpointAuth('/images/980749d3-b383-4083-9587-207822525ee6', 'PUT', () => app);
  });
  describe('/images/:id (DELETE)', () => {
    testEndpointAuth('/images/55157a63-5405-442d-a770-6aa3078f00e4', 'DELETE', () => app);
  });
});
