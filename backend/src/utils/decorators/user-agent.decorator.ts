import { ExecutionContext, createParamDecorator } from '@nestjs/common';

/**
 * Retrieves the information in the AuthTokenPayload from the request for the logged in user
 */
/* istanbul ignore next */
export const UserAgent = createParamDecorator((_, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();

  return request['headers']['user-agent'];
});
