import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '../src/app.module';
import { setupApp } from '../src/main';
import { testEndpointAuth } from './testutils/auth.testutil';
import { setupTestConfig } from './testutils/setup.testutil';

describe('SystemController (e2e)', () => {
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

  describe('/system (GET)', () => {
    testEndpointAuth('/system', 'GET', () => app);
  });
});
