import { LoginResultDto } from 'src/auth/dto/login.result.dto';
import { AccountEntity } from 'src/auth/entities/account.entity';

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AuthTokenPayload } from './auth-token.interface';

@Injectable()
export class AuthJwtService {
  constructor(private jwtService: JwtService) {}

  async signUser(account: AccountEntity): Promise<LoginResultDto> {
    const payload: AuthTokenPayload = {
      email: account.email,
      login: account.email,
      sub: account.id,
    };

    return {
      ...payload,
      token: await this.jwtService.signAsync(payload),
      id: payload.sub,
    };
  }
}
