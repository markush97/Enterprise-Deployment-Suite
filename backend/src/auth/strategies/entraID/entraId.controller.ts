import { Controller, Get, HttpStatus, Redirect, Post, UseGuards, Res } from '@nestjs/common';
import { EntraIdAuthGuard } from './entraId.guard';
import { AuthService } from 'src/auth/auth.service';
import { AccountInfo } from 'src/auth/auth-user.decorator';
import { EntraIdTokenPayload } from './interface/emtra-token.interface';
import { LoginResultDto } from 'src/auth/dto/login.result.dto';

@Controller('auth/sso/entraId')
export class EntraIdController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @UseGuards(EntraIdAuthGuard)
    async login(@AccountInfo() entraIdInfo: EntraIdTokenPayload): Promise<LoginResultDto> {
        return this.authService.loginEntraUser(entraIdInfo)

    }

}
