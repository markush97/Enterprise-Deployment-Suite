import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const Device = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.device;
});
