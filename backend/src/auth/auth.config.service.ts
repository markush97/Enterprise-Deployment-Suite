import { Algorithm } from 'jsonwebtoken';
import { ExtractJwt, StrategyOptions } from 'passport-jwt';
import { CoreConfigService } from 'src/core/config/core.config.service';

import { Injectable } from '@nestjs/common';
import { JwtModuleOptions, JwtOptionsFactory } from '@nestjs/jwt';

@Injectable()
export class AuthConfigService implements JwtOptionsFactory {
  constructor(private readonly config: CoreConfigService) {}

  public get refreshTokenLifespan(): number {
    return this.config.get<number>('REFRESH_TOKEN_VALIDITY_DAYS', 30) * 24 * 60 * 60 * 1000;
  }

  private get jwtSecret(): string {
    const secret = this.config.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not set');
    }
    return secret;
  }
  private get jwtAlgorithm(): Algorithm {
    return this.config.get<Algorithm>('JWT_ALGORITHM', 'HS384');
  }

  private get jwtAudience(): string {
    return this.config.get<string>('JWT_AUDIENCE', 'https://eds.cwi.at');
  }

  private get jwtIssuer(): string {
    return this.config.get<string>('JWT_ISSUER', 'EDS');
  }

  private get jwtExpiration(): string {
    return this.config.get<string>('JWT_EXPIRATION', '2h');
  }

  public createJwtOptions = (): JwtModuleOptions => ({
    secret: this.jwtSecret,
    signOptions: {
      algorithm: this.jwtAlgorithm,
      expiresIn: this.jwtExpiration,
      issuer: this.jwtIssuer,
      audience: this.jwtAudience,
    },
  });

  public createJwtStrategyOptions = (): StrategyOptions => ({
    secretOrKey: this.jwtSecret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    issuer: this.jwtIssuer,
    audience: this.jwtAudience,
  });
}
