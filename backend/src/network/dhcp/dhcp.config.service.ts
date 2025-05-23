import { CoreConfigService } from 'src/core/config/core.config.service';

import { Injectable } from '@nestjs/common';

@Injectable()
export class DHCPConfigService {
  constructor(private readonly config: CoreConfigService) {}

  get port(): number {
    return this.config.get<number>('DHCP_SERVER_PORT', 67);
  }
}
