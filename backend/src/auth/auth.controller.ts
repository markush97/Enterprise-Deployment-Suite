import { Response } from 'express';

import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  Res,
} from '@nestjs/common';

import { AccountInfo } from '../utils/decorators/auth-user.decorator';
import { Cookie } from '../utils/decorators/cookie.decorator';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { LoginResultDto } from './dto/login.result.dto';
import { AccountEntity } from './entities/account.entity';
import { AuthTokenPayload } from './strategies/jwt/auth-token.interface';
import {
  REFRESH_TOKEN_COOKIE_NAME,
  RefreshTokenEntity,
} from './strategies/refreshtoken/refresh-token.entity';
import { RefreshTokenOutDto } from './strategies/refreshtoken/refresh-token.out.dto';
import { RefreshTokenService } from './strategies/refreshtoken/refreshtoken.service';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger('AuthController');
  constructor(
    private readonly authService: AuthService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  @Get()
  public async getAccounts(): Promise<AccountEntity[]> {
    return this.authService.getAccounts();
  }

  @Get('self')
  public async getOwnAccount(@AccountInfo() accountInfo: AuthTokenPayload): Promise<AccountEntity> {
    return this.authService.getOwnAccount(accountInfo.sub);
  }

  @Get('refresh')
  public async getRefreshTokens(
    @AccountInfo() accountInfo: AuthTokenPayload,
    @Cookie(REFRESH_TOKEN_COOKIE_NAME) currentToken: string,
  ): Promise<RefreshTokenOutDto[]> {
    this.logger.log(`Refreshing access token`);

    return this.refreshTokenService.getRefreshTokens(accountInfo.sub, currentToken);
  }

  @Post('refresh')
  @Public() // This endpoint is marked public since it is protected by refreshtoken validation anyways
  @HttpCode(HttpStatus.OK)
  public async refreshAccessToken(
    @Cookie(REFRESH_TOKEN_COOKIE_NAME) token: string,
  ): Promise<LoginResultDto> {
    this.logger.debug(`Refreshing access token`);

    return this.authService.refreshAccessToken(token);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @Public()
  public async logout(
    @Cookie(REFRESH_TOKEN_COOKIE_NAME) token: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    this.logger.debug(`Logging out user and clearing refresh token`);
    if (token) {
      await this.refreshTokenService.rejectRefreshtokenByToken(token);
    }
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME);
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  public async validateToken(): Promise<void> {}

  @Delete('refresh')
  public async rejectAllRefreshTokens(@AccountInfo() accountInfo: AuthTokenPayload): Promise<void> {
    await this.refreshTokenService.rejectAllRefreshtoken(accountInfo.sub);
  }

  @Delete('refresh/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async rejectRefreshTokenById(
    @AccountInfo() accountInfo: AuthTokenPayload,
    @Param('id') tokenId: string,
  ): Promise<void> {
    await this.refreshTokenService.rejectRefreshtokenById(accountInfo.sub, tokenId);
  }
}
