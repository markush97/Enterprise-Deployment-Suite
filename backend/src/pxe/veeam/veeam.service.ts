import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { promises as fs } from 'fs';
import * as path from 'path';
import { VeeamConfigService } from './veaam.config.service';

@Injectable()
export class VeeamService {
  constructor(private readonly em: EntityManager, private readonly veeamConfig: VeeamConfigService) {}

  private async generateVeeamBootConfig(backupId: string, restorePoint = 'latest') {
    const configContent = `
default veeam
timeout 5

label veeam
  menu label Veeam Bare Metal Recovery
  kernel /veeam/kernel.efi
  append initrd=/veeam/initrd.img veeam.server=${this.veeamConfig.serverIp} veeam.port=${this.veeamConfig.serverPort} veeam.backup=${backupId} veeam.restore_point=${restorePoint} quiet
`;
    
    await fs.writeFile(
      path.join('./temp/pxetest', 'pxelinux.cfg', 'default'),
      configContent
    );
  }
}