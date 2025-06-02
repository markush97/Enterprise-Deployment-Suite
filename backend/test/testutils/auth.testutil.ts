import * as jwt from 'jsonwebtoken';
import { AuthTokenPayload } from 'src/auth/strategies/jwt/auth-token.interface';
import * as request from 'supertest';

import { INestApplication } from '@nestjs/common';

import { testConfig } from './config.testutil';

export const TOKEN_PAYLOAD_VALID = {
  email: 'test@example.com',
  login: 'test@example.com',
  sub: 'f4417424-4470-4bca-90f6-ebaa413e3619',
};

const jwtSigningBaseOptions: jwt.SignOptions = {
  algorithm: testConfig.JWT_ALGORITHM as jwt.Algorithm,
  audience: testConfig.JWT_AUDIENCE,
  issuer: testConfig.JWT_ISSUER,
};

export async function validateJwt(token: string): Promise<string | jwt.JwtPayload | false> {
  try {
    return jwt.verify(token, testConfig.JWT_SECRET, jwtSigningBaseOptions);
  } catch {
    return false;
  }
}

export async function getValidJwt(
  tokenPayload: AuthTokenPayload = TOKEN_PAYLOAD_VALID,
): Promise<string> {
  return jwt.sign(tokenPayload, testConfig.JWT_SECRET, {
    ...jwtSigningBaseOptions,
    expiresIn: '1h',
  });
}

export async function getInvalidJwt(): Promise<string> {
  return jwt.sign(TOKEN_PAYLOAD_VALID, 'wrong-secret', {
    ...jwtSigningBaseOptions,
    expiresIn: '1h',
  });
}

export function getMalformedJwt(): string {
  return 'not.a.jwt.token';
}

export async function getExpiredJwt(): Promise<string> {
  return jwt.sign(TOKEN_PAYLOAD_VALID, testConfig.JWT_SECRET, {
    ...jwtSigningBaseOptions,
    expiresIn: -3600,
  });
}

export function testEndpointAuth(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  getApp: () => INestApplication,
) {
  it(`Should fail auth with no token`, async () => {
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
    } else if (method === 'PATCH') {
      req = reqBase.patch(endpoint);
    }

    return req.expect(401);
  });

  it(`Should fail auth with invalid JWT`, async () => {
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
    } else if (method === 'PATCH') {
      req = reqBase.patch(endpoint);
    }
    return req.set('Authorization', `Bearer ${token}`).expect(401);
  });

  it(`Should fail auth with expired JWT`, async () => {
    const token = await getExpiredJwt();
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
    } else if (method === 'PATCH') {
      req = reqBase.patch(endpoint);
    }
    return req.set('Authorization', `Bearer ${token}`).expect(401);
  });
}
