import { Injectable } from '@nestjs/common';
import * as os from 'os';

@Injectable()
export class NetworkService {
  async getInterfaces(): Promise<os.NetworkInterfaceInfo[]> {
    const interfaces = os.networkInterfaces();
    const result: os.NetworkInterfaceInfo[] = [];

    return result;
  }
}