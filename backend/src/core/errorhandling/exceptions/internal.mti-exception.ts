import { HttpStatus } from '@nestjs/common';

import { MTIHttpException } from './mit-exception';
import { MTIErrorCodes } from './mti.error-codes.enum';

export class InternalMTIException extends MTIHttpException {
  constructor(errorCode: MTIErrorCodes, message?: string | Record<string, unknown>) {
    super(errorCode, message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
