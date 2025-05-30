import { readFileSync } from 'fs';
import { resolve } from 'path';
import { TFTPServer, createServer } from 'tftp2';

import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { TFTPConfigService } from './tftp.config.service';

@Injectable()
export class TFTPService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('TFTPService');
  private tftpServer: TFTPServer;

  constructor(private readonly tftpConfig: TFTPConfigService) {}

  async onModuleInit() {
    this.logger.log('Initializing TFTP-Server...');

    this.tftpServer = createServer();

    this.tftpServer.on('get', async (req, send) => {
      const { filename, address } = req;
      this.logger.debug(`Client ${address} fetching ${filename}`);
      await send(readFileSync(resolve(this.tftpConfig.fileRoot, filename)));
    });

    //await this.tftpServer.listen(this.tftpConfig.port);
    this.logger.log(`TFTP-Server listening on port ${this.tftpConfig.port}`);
  }

  onModuleDestroy() {
    this.logger.log(`Shutting down TFTP Server`);
    this.tftpServer.close();
  }
}
