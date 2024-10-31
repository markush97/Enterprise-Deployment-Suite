import { HttpStatus } from '@nestjs/common';
import { MTIHttpException } from './mit-exception';
import { MTIErrorCodes } from './mti.error-codes.enum';

export class BadRequestMTIException extends MTIHttpException {
    constructor(
        readonly errorCode: MTIErrorCodes,
        message?: string | Record<string, unknown> | string[] | unknown
    ) {
        super(errorCode, message, HttpStatus.BAD_REQUEST);
    }
}
