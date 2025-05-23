declare module 'tftp2' {
  import { Socket } from 'dgram';

  export function createServer(): TFTPServer;

  export class TFTPServer extends Socket {
    listen(port: number): Promise<void>;
    handleMessage(message: unknown, rinfo: unknown): this;
    handleReadRequest(client: unknown): void;
    handleWriteRequest(client: unknown): void;
  }
}
