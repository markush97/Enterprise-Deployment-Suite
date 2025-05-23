import { Controller, Get, HttpStatus, Redirect, Post, UseGuards, Res } from '@nestjs/common';
import { EntraIdAuthGuard } from './entraId.guard';
import { AuthService } from 'src/auth/auth.service';
import { AccountInfo } from 'src/utils/decorators/auth-user.decorator';
import { EntraIdTokenPayload } from './interface/emtra-token.interface';
import { LoginResultDto } from 'src/auth/dto/login.result.dto';
import { RefreshTokenService } from '../refreshtoken/refreshtoken.service';
import { Cookie } from 'src/utils/decorators/cookie.decorator';
import { log } from 'console';
import { REFRESH_TOKEN_COOKIE_NAME } from '../refreshtoken/refresh-token.entity';
import { UserAgent } from '../../../utils/decorators/user-agent.decorator';
import { RealIP } from 'nestjs-real-ip';
import { Response } from 'express';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('auth/sso/entraId')
export class EntraIdController {
    constructor(private readonly authService: AuthService, private readonly refreshTokenService: RefreshTokenService) { }

    @Post('login')
    @Public()
    @UseGuards(EntraIdAuthGuard)
    async login(@AccountInfo() entraIdInfo: EntraIdTokenPayload, @Res({ passthrough: true }) res: Response, @UserAgent() userAgent: string, @RealIP() ipAddress: string): Promise<LoginResultDto> {
        const loginResult = await this.authService.loginEntraUser(entraIdInfo)

        const cookie = await this.refreshTokenService.createRefreshTokenCookie({ accountId: loginResult.id, userAgent, ipAddress })
        res.cookie(REFRESH_TOKEN_COOKIE_NAME, ...cookie)

        return loginResult;

    }

}
