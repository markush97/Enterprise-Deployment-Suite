import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { MTIErrorCodes } from 'src/core/errorhandling/exceptions/mti.error-codes.enum';
import { JwtAuthGuard } from './strategies/jwt/jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor() { }

    /**
     * Validate an access-token
     *
     *
     * @throws {UnauthorizedSavedateException} UnauthorizedSavedateException if the provided token is invalid
     */
    @Post('validate')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        description: 'The token is valid',
    })
    @ApiUnauthorizedResponse({
        description: 'The token is invalid',
        schema: {
            properties: {
                message: {
                    example: 'Provided token is either invalid or expired',
                },
                savedateErrorCode: {
                    example: MTIErrorCodes.JWTInvalid,
                },
            },
        },
    })
    public async validateToken(): Promise<void> { }
}
