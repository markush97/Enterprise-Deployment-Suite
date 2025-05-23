import { Injectable } from '@nestjs/common';
import { CoreConfigService } from 'src/core/config/core.config.service';


@Injectable()
export class AuthConfigService {
    constructor(private readonly config: CoreConfigService) {
    }

    private get jwtSecret(): string {
        const secret = this.config.get<string>('JWT_SECRET')
        if (!secret) {
            throw new Error('JWT_SECRET is not set');
        }
        return secret;
    }

    get jwtConfig() {
        return {
            secret: this.jwtSecret,
            signOptions: { expiresIn: '60s' },
        };
    }
}
