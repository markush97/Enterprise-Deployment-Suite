import { AppAuthGuard } from 'src/auth/strategies/jwt/app-auth.guard';

import { Controller, Get, UseGuards } from '@nestjs/common';

import { SystemService } from './system.service';

@Controller('system')
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Get()
  async getSystemInfo() {
    return this.systemService.getSystemInfo();
  }
}
