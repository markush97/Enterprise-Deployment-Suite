import { CoreConfigService } from 'src/core/config/core.config.service';

import { Injectable } from '@nestjs/common';

@Injectable()
export class NetworkConfigService {
  constructor(private readonly config: CoreConfigService) {}

  get includeInternalNetworks(): boolean {
    return this.config.get<boolean>('NET_INCLUDE_INTERNAL_INTERFACES', false);
  }

  get ipv4Only(): boolean {
    return this.config.get<boolean>('NET_INTERFACE_IPv4_ONLY', true);
  }

  get hostName(): string {
    return this.config.hostname;
  }

  get domainName(): string {
    return this.config.domainName;
  }
}
