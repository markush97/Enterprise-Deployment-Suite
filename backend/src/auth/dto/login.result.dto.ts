
import { AuthTokenPayload } from '../strategies/jwt/auth-token.interface';

/**
 * Successfully logged in the user
 */
export class LoginResultDto implements AuthTokenPayload {
    constructor(payload: AuthTokenPayload, token: string) {
        this.token = token;
        Object.assign(this, payload);
    }
    login: string;
    id: string;
    sub: string;
    email: string;
    public readonly token: string;
}
