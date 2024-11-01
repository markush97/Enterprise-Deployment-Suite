declare module 'tftp2' {
  import { Socket } from 'dgram';

  export const createServer = (): TFTPServer => any
  export class TFTPServer extends Socket {

      listen(port: number): Promise;
      handleMessage(message, rinfo): this;
      handleReadRequest(client): void;
      handleWriteRequest(client): void;
    
  }
}