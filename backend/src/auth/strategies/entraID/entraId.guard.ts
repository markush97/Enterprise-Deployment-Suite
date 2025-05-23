import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class EntraIdAuthGuard extends AuthGuard('EntraId') {
  private readonly logger = new Logger('EntraIdAuthGuard');
  handleRequest(err, user, info) {
    if (err || !user) {
      this.logger.warn(err);
      throw err || new UnauthorizedException(info?.message || 'Unauthorized');
    }
    return user;
  }
}
