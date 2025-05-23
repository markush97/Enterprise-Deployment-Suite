import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { MTIErrorCodes } from 'src/core/errorhandling/exceptions/mti.error-codes.enum';
import { JwtAuthGuard } from './strategies/jwt/jwt-auth.guard';
import { AccountEntity } from './entities/account.entity';
import { AuthService } from './auth.service';
import { EntraIdAuthGuard } from './strategies/entraID/entraId.guard';
import { AccountInfo } from './auth-user.decorator';
import { AuthTokenPayload } from './strategies/jwt/auth-token.interface';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

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
}
