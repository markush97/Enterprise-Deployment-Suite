import { ExecutionContext, createParamDecorator } from '@nestjs/common';

/**
 * Extracts the cookie with the provided key out of the request
 */
export const Cookie = createParamDecorator((cookieKey: string, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();

  return extractCookie(request.headers.cookie, cookieKey);
});

const extractCookie = (cookieString: string, cookieKey: string): string => {
  let result = '';

  const name = cookieKey + '=';

  const decodedCookie = decodeURIComponent(cookieString);
  const cookieArray = decodedCookie.split(';');

  cookieArray.forEach((cookie: string) => {
    const index = cookie.indexOf(name);
     
    /* istanbul ignore next */ if (index >= 0) {
      result = cookie.substring(index + name.length);
      return;
    }
  });
  return result;
};
