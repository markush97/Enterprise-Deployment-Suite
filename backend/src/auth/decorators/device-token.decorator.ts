// device-token.decorator.ts
import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';

import { DeviceGuard } from '../strategies/jwt/device-auth.guard';
import { IS_PUBLIC_KEY } from './public.decorator';

export const REQUIRES_DEVICE_TOKEN = 'requiresDeviceToken';

export const UseDeviceTokenGuard = () =>
  applyDecorators(
    SetMetadata(REQUIRES_DEVICE_TOKEN, true),
    SetMetadata(IS_PUBLIC_KEY, true),
    UseGuards(DeviceGuard),
  );
