import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { MTIErrorCodes } from 'src/core/errorhandling/exceptions/mti.error-codes.enum';
import { JwtAuthGuard } from './strategies/jwt/jwt-auth.guard';
import { AccountEntity } from './entities/account.entity';
import { AuthService } from './auth.service';
import { EntraIdAuthGuard } from './strategies/entraID/entraId.guard';
import { AccountInfo } from './auth-user.decorator';
import { AuthTokenPayload } from './strategies/jwt/auth-token.interface';
import { REFRESH_TOKEN_COOKIE_NAME, RefreshTokenEntity } from './strategies/refreshtoken/refresh-token.entity';
import { LoginResultDto } from './dto/login.result.dto';
import { Cookie } from './cookie.decorator';
import { RefreshTokenService } from './strategies/refreshtoken/refreshtoken.service';

@Controller('auth')
export class AuthController {
    private readonly logger = new Logger('AuthController')
    constructor(private readonly authService: AuthService, private readonly refreshTokenService: RefreshTokenService) { }

    /**
     * Validate an access-token
     *
     * @throws {UnauthorizedSavedateException} UnauthorizedSavedateException if the provided token is invalid
     */
    @Post('validate')
    @UseGuards(JwtAuthGuard)
    public async validateToken(): Promise<void> { }

    @Get()
    public async getAccounts(): Promise<AccountEntity[]> {
        return this.authService.getAccounts();
    }

    @Get('self')
    @UseGuards(JwtAuthGuard)
    public async getOwnAccount(@AccountInfo() accountInfo: AuthTokenPayload): Promise<AccountEntity> {
        return this.authService.getOwnAccount(accountInfo.sub)
    }

    @Get('refresh')
    @UseGuards(JwtAuthGuard)
    public async getRefreshTokens(@AccountInfo() accountInfo: AuthTokenPayload): Promise<RefreshTokenEntity[]> {
        this.logger.log(`Refreshing access token`);

        return this.refreshTokenService.getRefreshTokens(accountInfo.sub);
    }

    @Post('refresh')
    public async refreshAccessToken(@Cookie(REFRESH_TOKEN_COOKIE_NAME) token: string): Promise<LoginResultDto> {
        this.logger.log(`Refreshing access token`);

        return this.authService.refreshAccessToken(token);
    }

    @Delete('refresh')
    @UseGuards(JwtAuthGuard)
    public async rejectAllRefreshTokens(@AccountInfo() accountInfo: AuthTokenPayload): Promise<void> {
        await this.refreshTokenService.rejectAllRefreshtoken(accountInfo.sub)
    }

    @Delete('refresh/:id')
    @UseGuards(JwtAuthGuard)
    public async rejectRefreshTokenById(@AccountInfo() accountInfo: AuthTokenPayload, @Param('id') tokenId: string): Promise<void> {
        await this.refreshTokenService.rejectRefreshtokenById(accountInfo.sub, tokenId)
    }
}
