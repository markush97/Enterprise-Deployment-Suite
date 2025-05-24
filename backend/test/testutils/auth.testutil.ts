import * as jwt from 'jsonwebtoken';

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
