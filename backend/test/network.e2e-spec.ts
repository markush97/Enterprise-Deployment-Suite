import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '../src/app.module';
import { setupApp } from '../src/main';
import { testEndpointAuth } from './testutils/auth.testutil';
import { setupTestConfig } from './testutils/setup.testutil';

describe('NetworkController (e2e)', () => {
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

  describe('/networks/interfaces (GET)', () => {
    testEndpointAuth('/networks/interfaces', 'GET', () => app);
  });
  describe('/networks/interfaces/reset (POST)', () => {
    testEndpointAuth('/networks/interfaces/reset', 'POST', () => app);
  });
  describe('/networks/interfaces/reload (POST)', () => {
    testEndpointAuth('/networks/interfaces/reload', 'POST', () => app);
  });
  describe('/networks/interfaces/:name/dhcp (POST)', () => {
    testEndpointAuth('/networks/interfaces/eth0/dhcp', 'POST', () => app);
  });
  describe('/networks/interfaces/:name/dhcp/reload (POST)', () => {
    testEndpointAuth('/networks/interfaces/eth0/dhcp/reload', 'POST', () => app);
  });
  describe('/networks/interfaces/dhcp/reload (POST)', () => {
    testEndpointAuth('/networks/interfaces/dhcp/reload', 'POST', () => app);
  });
});
