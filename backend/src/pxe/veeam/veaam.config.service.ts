import { CoreConfigService } from 'src/core/config/core.config.service';

import { Injectable } from '@nestjs/common';

@Injectable()
export class VeeamConfigService {
  constructor(private readonly config: CoreConfigService) {}

  public get serverIp(): string {
    return this.config.get<string>('VEEAM_SERVER_HOST', 'backup');
  }

  public serverPort(): number {
    return this.config.get<number>('VEEAM_SERVER_PORT', 10005);
  }

  public userName(): string {
    return this.config.get<string>('VEEAM_SERVER_USER', 'restoreuser');
  }

  public password(): string {
    return this.config.get<string>('VEEAM_SERVER_PASSWORD', 'password');
  }
}
