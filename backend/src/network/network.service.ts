import { Injectable } from '@nestjs/common';
import { NetworkInterface } from '../types/network.interface';
import * as os from 'os';

@Injectable()
export class NetworkService {
  async getInterfaces(): Promise<NetworkInterface[]> {
    const interfaces = os.networkInterfaces();
    const result: NetworkInterface[] = [];

    for (const [name, addrs] of Object.entries(interfaces)) {
      if (addrs) {
        const ipv4 = addrs.find(addr => addr.family === 'IPv4' && !addr.internal);
        if (ipv4) {
          result.push({
            name,
            info: {
              address: ipv4.address,
              netmask: ipv4.netmask,
              family: 'IPv4',
              mac: ipv4.mac,
              internal: ipv4.internal,
              cidr: ipv4.cidr,
            },
          });
        }
      }
    }

    return result;
  }
}