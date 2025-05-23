import { Observable } from 'rxjs';

import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

import { IS_PUBLIC_KEY } from '../../decorators/public.decorator';

@Injectable()
export class AppAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super(reflector);
  }

  canActivate(context: ExecutionContext): Promise<boolean> | Observable<boolean> | boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const result = super.canActivate(context);
    return result;
  }
}
