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

  async getVeeamRecoveryInstructions(): Promise<string> {
    return `
1. Exportieren Sie die Veeam Recovery Media vom Backup-Server:
   - Öffnen Sie Veeam Backup & Replication Console
   - Gehen Sie zu: Tools -> Recovery Media Builder
   - Erstellen Sie ein neues ISO Image
   - Extrahieren Sie kernel.efi und initrd.img aus dem ISO

2. Kopieren Sie die Dateien in den TFTP-Server:
   - kernel.efi -> tftp-root/veeam/kernel.efi
   - initrd.img -> tftp-root/veeam/initrd.img

3. Starten Sie den Client-Computer via PXE
   - Das System wird automatisch die Veeam Recovery Environment laden
   - Der Restore-Prozess startet automatisch mit den konfigurierten Parametern
    `;
  }
}