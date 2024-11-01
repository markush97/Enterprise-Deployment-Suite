import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { TFTPServer, createServer } from 'tftp2';
import { readFileSync,writeFileSync } from 'fs';
import { TFTPConfigService } from './tftp.config.service';
import { resolve } from 'path';

@Injectable() 
export class TFTPService implements OnModuleInit {
    private readonly logger = new Logger('TFTPService');
    private tftpServer: TFTPServer;

    constructor(private readonly tftpConfig:TFTPConfigService) {}

    async onModuleInit() {
        this.logger.log('Initializing TFTP-Server...');

        this.tftpServer = createServer();

        this.tftpServer.on('get', async (req, send) => {
            const { filename, mode, address, port } = req;
            this.logger.debug(`Client ${address} fetching ${filename}`);
            await send(readFileSync(resolve(this.tftpConfig.fileRoot,filename)));
        });

        await this.tftpServer.listen(this.tftpConfig.port);
        this.logger.log(`TFTP-Server listening on port ${this.tftpConfig.port}`);
    }
}
