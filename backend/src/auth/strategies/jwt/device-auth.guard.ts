import { ForbiddenMTIException } from 'src/core/errorhandling/exceptions/forbidden.mti-exception';
import { MTIErrorCodes } from 'src/core/errorhandling/exceptions/mti.error-codes.enum';
import { DevicesService } from 'src/devices/devices.service';

import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class DeviceGuard implements CanActivate {
  private readonly logger = new Logger('DeviceGuard');
  constructor(
    private reflector: Reflector,
    private deviceService: DevicesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const deviceToken = request.headers['x-device-token'];

    const device = await this.deviceService.findOneByToken(deviceToken);
    if (!device) {
      this.logger.error('Device not found');
      throw new ForbiddenMTIException(MTIErrorCodes.DEVICE_TOKEN_INVALID, 'Invalid device token');
    }

    request.device = device;
    return true;
  }
}
