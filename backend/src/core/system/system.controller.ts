import { Controller, Get, UseGuards } from '@nestjs/common';
import { SystemService } from './system.service';
import { AppAuthGuard } from 'src/auth/strategies/jwt/app-auth.guard';

@Controller('system')
export class SystemController {
    constructor(private readonly systemService: SystemService) { }

    @Get()
    async getSystemInfo() {
        return this.systemService.getSystemInfo();
    }
}
