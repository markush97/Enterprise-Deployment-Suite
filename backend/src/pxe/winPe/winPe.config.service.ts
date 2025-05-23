import { CoreConfigService } from 'src/core/config/core.config.service';

import { Injectable } from '@nestjs/common';

@Injectable()
export class WinPeConfigService {
  constructor(private readonly configService: CoreConfigService) {}

  get captureDirectory(): string {
    return this.configService.get<string>('WINPE_CAPTURE_DIR', '/tmp/captures');
  }

  get;
}
