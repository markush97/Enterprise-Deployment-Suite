import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('users')
export class UserController {
    constructor() { }

    @Get('self')
    @UseGuards(AuthGuard())
    public async getOwnUser() {
        return "It worked!"
    }
}
