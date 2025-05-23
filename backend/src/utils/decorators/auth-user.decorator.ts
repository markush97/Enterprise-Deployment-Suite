/**
 * Retrieves the information in the AuthTokenPayload from the request for the logged in user
 */
import { ExecutionContext, createParamDecorator } from '@nestjs/common';

/* istanbul ignore next */
export const AccountInfo = createParamDecorator((_, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();

  return request.user;
});
