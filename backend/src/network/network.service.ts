import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { networkInterfaces } from 'os';
import { NetworkInterface } from './networkInterface.interface';
import { ConfigureDHCPDto } from './dhcp/dto/configure-dhcp.dto';
import { Network } from 'inspector/promises';
import { BadRequestMTIException } from 'src/core/errorhandling/exceptions/bad-request.mti-exception';
import { MTIErrorCodes } from 'src/core/errorhandling/exceptions/mti.error-codes.enum';
import { DHCPService } from './dhcp/dhcp.service';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { NetworkInterfaceEntity } from './entities/networkinterface.entity';
import { InjectRepository } from '@mikro-orm/nestjs';

@Injectable()
export class NetworkService implements OnModuleInit {
  private readonly logger = new Logger('NetworkService')
  private interfaces: Record<string, NetworkInterface>;

  constructor(private readonly dhcpService: DHCPService, @InjectRepository(NetworkInterfaceEntity)
  private readonly networkRepository: EntityRepository<NetworkInterfaceEntity>, private readonly em: EntityManager) { }

  onModuleInit() {
    this.reloadInterfaces();
  }

  reloadInterfaces() {
    const allInterfaces = networkInterfaces();

    const interfaces: Record<string, NetworkInterface> = {};

    // interate over every interface
    Object.entries(allInterfaces).forEach(([name, iface]) => {
      let tmpIface: NetworkInterface = { mac: iface[0]?.mac, addresses: [], name: name };

      // Every interface can have multiple addresses
      iface.forEach(ifaceAddress => {
        if (!ifaceAddress.internal) {
          tmpIface.addresses.push({ address: ifaceAddress.address, cidr: ifaceAddress.cidr, family: ifaceAddress.family, internal: ifaceAddress.internal, netmask: ifaceAddress.netmask })
        }

        if (tmpIface.addresses.length > 0) {
          // Only include interfaces with an address set
          interfaces[name] = tmpIface;
        }
      });
    });
    this.interfaces = interfaces;
  }

  async configureDhcp(interfaceName: string, dhcpConfig: ConfigureDHCPDto) {
    const iface = this.interfaces[interfaceName];

    if (iface === undefined) {
      throw new BadRequestMTIException(MTIErrorCodes.UNKNOWN_INTERFACE, 'Cannot configure unknown interface!');
    }

    await this.networkRepository.upsert({ name: interfaceName, mac: iface.mac, dhcpConfig: dhcpConfig })
    await this.em.flush();

    await this.dhcpService.stopServer(interfaceName);
    await this.dhcpService.initializeServer(iface, dhcpConfig);
    await this.dhcpService.startServer(iface.name);
  }

  getInterfaces(): Record<string, NetworkInterface> {
    return this.interfaces;
  }
}