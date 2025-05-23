import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as jwksRsa from 'jwks-rsa';
import { EntraIdConfigService } from './entraId.config.service';

@Injectable()
export class EntraIdStrategy extends PassportStrategy(Strategy, 'EntraId') {
    private readonly logger = new Logger('EntraIdStrategy')
    constructor(protected readonly entraConfig: EntraIdConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            issuer: `https://sts.windows.net/${entraConfig.tenantId}/`,
            algorithms: ['RS256'],
            audience: `api://${entraConfig.clientId}`,
            ignoreExpiration: true,
            secretOrKeyProvider: jwksRsa.passportJwtSecret({
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 5,
                jwksUri: `https://login.microsoftonline.com/${entraConfig.tenantId}/discovery/v2.0/keys`,
                handleSigningKeyError: (err, cb) => {
                    this.logger.error('Error fetching JWKS key', err);
                    cb(err);
                },
            }),
        });
    }

    validate(payload: any) {
        return payload;
    }
}
