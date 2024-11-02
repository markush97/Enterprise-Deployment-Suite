import { Injectable } from '@nestjs/common';
import { NetworkInterfaceInfo, networkInterfaces } from 'os';

@Injectable()
export class NetworkService {
  async getInterfaces(): Promise<NodeJS.Dict<NetworkInterfaceInfo[]>> {
    const interfaces = networkInterfaces();

    return interfaces;
  }
}