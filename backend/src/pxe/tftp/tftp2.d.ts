declare module 'tftp2' {
  import { Socket } from 'dgram';

  export function createServer(): TFTPServer;

  export class TFTPServer extends Socket {
    listen(port: number): Promise<void>;
    handleMessage(message: any, rinfo: any): this;
    handleReadRequest(client: any): void;
    handleWriteRequest(client: any): void;
  }
}
