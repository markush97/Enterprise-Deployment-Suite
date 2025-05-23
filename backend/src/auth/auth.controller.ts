import { Controller, Delete, Get, Logger, Param, Post } from '@nestjs/common';

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
  ): Promise<RefreshTokenEntity[]> {
    this.logger.log(`Refreshing access token`);

    return this.refreshTokenService.getRefreshTokens(accountInfo.sub);
  }

  @Post('refresh')
  @Public() // This endpoint is marked public since it is protected by refreshtoken validation anyways
  public async refreshAccessToken(
    @Cookie(REFRESH_TOKEN_COOKIE_NAME) token: string,
  ): Promise<LoginResultDto> {
    this.logger.log(`Refreshing access token`);

    return this.authService.refreshAccessToken(token);
  }

  @Post('validate')
  public async validateToken(): Promise<void> {}

  @Delete('refresh')
  public async rejectAllRefreshTokens(@AccountInfo() accountInfo: AuthTokenPayload): Promise<void> {
    await this.refreshTokenService.rejectAllRefreshtoken(accountInfo.sub);
  }

  @Delete('refresh/:id')
  public async rejectRefreshTokenById(
    @AccountInfo() accountInfo: AuthTokenPayload,
    @Param('id') tokenId: string,
  ): Promise<void> {
    await this.refreshTokenService.rejectRefreshtokenById(accountInfo.sub, tokenId);
  }
}
