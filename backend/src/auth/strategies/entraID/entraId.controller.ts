import { Controller, Get, HttpStatus, Redirect, Post, UseGuards, Res } from '@nestjs/common';
import { EntraIdAuthGuard } from './entraId.guard';
import { AuthService } from 'src/auth/auth.service';
import { AccountInfo } from 'src/auth/auth-user.decorator';
import { EntraIdTokenPayload } from './interface/emtra-token.interface';
import { LoginResultDto } from 'src/auth/dto/login.result.dto';
import { RefreshTokenService } from '../refreshtoken/refreshtoken.service';
import { Cookie } from 'src/auth/cookie.decorator';
import { log } from 'console';
import { REFRESH_TOKEN_COOKIE_NAME } from '../refreshtoken/refresh-token.entity';
import { UserAgent } from '../refreshtoken/user-agent.decorator';
import { RealIP } from 'nestjs-real-ip';
import { Response } from 'express';

@Controller('auth/sso/entraId')
export class EntraIdController {
    constructor(private readonly authService: AuthService, private readonly refreshTokenService: RefreshTokenService) { }

    @Post('login')
    @UseGuards(EntraIdAuthGuard)
    async login(@AccountInfo() entraIdInfo: EntraIdTokenPayload, @Res({ passthrough: true }) res: Response, @UserAgent() userAgent: string, @RealIP() ipAddress: string): Promise<LoginResultDto> {
        const loginResult = await this.authService.loginEntraUser(entraIdInfo)

        const cookie = await this.refreshTokenService.createRefreshTokenCookie({ accountId: loginResult.id, userAgent, ipAddress })
        res.cookie(REFRESH_TOKEN_COOKIE_NAME, ...cookie)

        return loginResult;

    }

}
