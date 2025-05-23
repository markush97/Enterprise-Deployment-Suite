import { CoreConfigService } from 'src/core/config/core.config.service';

import { Injectable } from '@nestjs/common';

@Injectable()
export class TFTPConfigService {
  constructor(private readonly config: CoreConfigService) {}

  public get port(): number {
    return this.config.get<number>('TFTP_PORT', 69);
  }

  public get fileRoot(): string {
    return this.config.get<string>('TFTP_ROOT', '/srv/tftp');
  }
}
