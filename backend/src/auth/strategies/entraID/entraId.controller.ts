import { log } from 'console';
import { Response } from 'express';
import { RealIP } from 'nestjs-real-ip';
import { AuthService } from 'src/auth/auth.service';
import { Public } from 'src/auth/decorators/public.decorator';
import { LoginResultDto } from 'src/auth/dto/login.result.dto';
import { AccountInfo } from 'src/utils/decorators/auth-user.decorator';
import { Cookie } from 'src/utils/decorators/cookie.decorator';

import { Controller, Get, HttpStatus, Post, Redirect, Res, UseGuards } from '@nestjs/common';

import { UserAgent } from '../../../utils/decorators/user-agent.decorator';
import { REFRESH_TOKEN_COOKIE_NAME } from '../refreshtoken/refresh-token.entity';
import { RefreshTokenService } from '../refreshtoken/refreshtoken.service';
import { EntraIdAuthGuard } from './entraId.guard';
import { EntraIdTokenPayload } from './interface/emtra-token.interface';

@Controller('auth/sso/entraId')
export class EntraIdController {
  constructor(
    private readonly authService: AuthService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  @Post('login')
  @Public()
  @UseGuards(EntraIdAuthGuard)
  async login(
    @AccountInfo() entraIdInfo: EntraIdTokenPayload,
    @Res({ passthrough: true }) res: Response,
    @UserAgent() userAgent: string,
    @RealIP() ipAddress: string,
  ): Promise<LoginResultDto> {
    const loginResult = await this.authService.loginEntraUser(entraIdInfo);

    const cookie = await this.refreshTokenService.createRefreshTokenCookie({
      accountId: loginResult.id,
      userAgent,
      ipAddress,
    });
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, ...cookie);

    return loginResult;
  }
}
