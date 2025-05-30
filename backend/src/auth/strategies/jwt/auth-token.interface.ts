export interface AuthTokenPayload {
  login: string;
  sub: string;
  email: string;
  name?: string;
}
