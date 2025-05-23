import { Controller, Get, HttpStatus, Redirect, Post, UseGuards } from '@nestjs/common';
import { EntraIdAuthGuard } from './entraId.guard';

@Controller('auth/sso/entraId')
export class EntraIdController {
    constructor() { }

    @Post('login')
    @UseGuards(EntraIdAuthGuard)
    async login() {

    }

}
