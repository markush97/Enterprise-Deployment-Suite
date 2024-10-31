import { HttpException, HttpStatus } from '@nestjs/common';
import { MTIErrorCodes } from './mti.error-codes.enum';

export class MTIHttpException extends HttpException {
    constructor(
        errorCode: MTIErrorCodes,
        message:
            | string
            | string[]
            | unknown
            | Record<string, unknown> = 'some error occurred.',
        httpErrorCode: HttpStatus
    ) {
        super(
            MTIHttpException.constructErrorObject(errorCode, message),
            httpErrorCode
        );
    }

    private static constructErrorObject(
        errorCode: MTIErrorCodes,
        message: string | string[] | Record<string, unknown> | unknown
    ): Record<string, unknown> {
        return {
            message: message,
            mtiErrorCode: errorCode,
        };
    }
}
