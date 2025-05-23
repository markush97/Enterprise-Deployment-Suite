import { Strategy } from 'passport-jwt';
import { AuthConfigService } from 'src/auth/auth.config.service';

import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { AuthTokenPayload } from './auth-token.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger('JwtStrategy');

  constructor(authConfig: AuthConfigService) {
    super({
      ...authConfig.createJwtStrategyOptions(),
      passReqToCallback: false,
    });
  }

  async validate(payload: AuthTokenPayload): Promise<AuthTokenPayload> {
    this.logger.log(`Validated account ${payload.sub} with login ${payload.login}`);

    return payload;
  }
}
