import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '../src/app.module';
import { setupApp } from '../src/main';
import { testEndpointAuth } from './testutils/auth.testutil';
import { setupTestConfig } from './testutils/setup.testutil';

describe('JobsController (e2e)', () => {
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

  describe('/jobs (GET)', () => {
    testEndpointAuth('/jobs', 'GET', () => app);
  });
  describe('/jobs/:id (GET)', () => {
    testEndpointAuth('/jobs/f7e81f10-2bd7-460f-ba8b-3e90f221a053', 'GET', () => app);
  });
  describe('/jobs (POST)', () => {
    testEndpointAuth('/jobs', 'POST', () => app);
  });
  // describe('/jobs/notify/:jobid/task (POST)', () => {});
  // describe('/jobs/notify/:jobid (POST)', () => {});
  describe('/jobs:id/device/autocreate (POST)', () => {
    testEndpointAuth(
      '/jobs/11b430b4-93ac-4fec-86b6-a15ab439899b/device/autocreate',
      'POST',
      () => app,
    );
  });
  describe('/jobs/:id/customer/:customerId (PUT)', () => {
    testEndpointAuth(
      '/jobs/980749d3-b383-4083-9587-207822525ee6/customer/106d04f0-be83-4b0a-b436-c7917ea5ad9f',
      'PUT',
      () => app,
    );
  });
  describe('/jobs/:id (DELETE)', () => {
    testEndpointAuth('/jobs/55157a63-5405-442d-a770-6aa3078f00e4', 'DELETE', () => app);
  });
});
