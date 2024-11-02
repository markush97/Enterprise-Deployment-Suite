import { Injectable, Logger } from '@nestjs/common';
import { NetworkInterfaceInfo, networkInterfaces } from 'os';
import { NetworkInterface } from './networkInterface.interface';

@Injectable()
export class NetworkService {
  private readonly logger = new Logger('NetworkService')

  async getInterfaces(includeInternalInterfaces: boolean): Promise<NetworkInterface[]> {
    const allInterfaces = networkInterfaces();

    const interfaces: Record<string, NetworkInterface> = {};

    // interate over every interface
    Object.entries(allInterfaces).forEach(([name, iface]) => {
      let tmpIface: NetworkInterface = { mac: iface[0]?.mac, addresses: [], name: name };
      
      // Every interface can have multiple addresses
      iface.forEach(ifaceAddress => {
        if (includeInternalInterfaces || !ifaceAddress.internal) {
          tmpIface.addresses.push({ address: ifaceAddress.address, cidr: ifaceAddress.cidr, family: ifaceAddress.family, internal: ifaceAddress.internal, netmask: ifaceAddress.netmask })
        }

        if (tmpIface.addresses.length > 0) {
          // Only include interfaces with an address set
          interfaces[name] = tmpIface;
        }
      });
    });

    // Return interfaces as list
    return Object.values(interfaces);
  }
}