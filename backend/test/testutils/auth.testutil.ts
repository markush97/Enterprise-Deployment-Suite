import * as jwt from 'jsonwebtoken';
import * as request from 'supertest';

import { INestApplication } from '@nestjs/common';

import { testConfig } from './config.testutil';

const payload = {
  email: 'test@example.com',
  login: 'test@example.com',
  sub: 'f4417424-4470-4bca-90f6-ebaa413e3619',
};

const jwtSigningBaseOptions: jwt.SignOptions = {
  algorithm: testConfig.JWT_ALGORITHM as jwt.Algorithm,
  audience: testConfig.JWT_AUDIENCE,
  issuer: testConfig.JWT_ISSUER,
};

export async function getValidJwt(): Promise<string> {
  return jwt.sign(payload, testConfig.JWT_SECRET, { ...jwtSigningBaseOptions, expiresIn: '1h' });
}

export async function getInvalidJwt(): Promise<string> {
  return jwt.sign(payload, 'wrong-secret', { ...jwtSigningBaseOptions, expiresIn: '1h' });
}

export function getMalformedJwt(): string {
  return 'not.a.jwt.token';
}

export async function getExpiredJwt(): Promise<string> {
  return jwt.sign(payload, testConfig.JWT_SECRET, { ...jwtSigningBaseOptions, expiresIn: -3600 });
}

export function testEndpointAuth(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  getApp: () => INestApplication,
) {
  describe(`Auth checks for ${method} ${endpoint}`, () => {
    it(`${endpoint} (${method}) - no token`, async () => {
      const reqBase = request(getApp().getHttpServer());
      let req: request.Test;

      if (method === 'GET') {
        req = reqBase.get(endpoint);
      } else if (method === 'POST') {
        req = reqBase.post(endpoint);
      } else if (method === 'PUT') {
        req = reqBase.put(endpoint);
      } else if (method === 'DELETE') {
        req = reqBase.delete(endpoint);
      }

      return req.expect(401);
    });

    it(`${endpoint} (${method}) - invalid JWT`, async () => {
      const token = await getInvalidJwt();
      const reqBase = request(getApp().getHttpServer());
      let req: request.Test;

      if (method === 'GET') {
        req = reqBase.get(endpoint);
      } else if (method === 'POST') {
        req = reqBase.post(endpoint);
      } else if (method === 'PUT') {
        req = reqBase.put(endpoint);
      } else if (method === 'DELETE') {
        req = reqBase.delete(endpoint);
      }
      return req.set('Authorization', `Bearer ${token}`).expect(401);
    });
  });
}
