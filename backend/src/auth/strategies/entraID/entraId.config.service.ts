import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EntraIdConfigService {
  constructor(private readonly configService: ConfigService) {}

  get audience(): string {
    return this.configService.get<string>('ENTRAID_AUDIENCE', 'https://eds.cwi.at');
  }

  get tenantId(): string {
    return this.configService.get<string>('ENTRAID_TENANT_ID');
  }

  get clientId(): string {
    return this.configService.get<string>('ENTRAID_CLIENT_ID');
  }

  get authorizationUrl(): string {
    return '';
  }
}
