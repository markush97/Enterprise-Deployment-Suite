import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { networkInterfaces } from 'os';
import { NetworkInterface } from './networkInterface.interface';
import { ConfigureDHCPDto } from './dhcp/dto/configure-dhcp.dto';
import { BadRequestMTIException } from 'src/core/errorhandling/exceptions/bad-request.mti-exception';
import { MTIErrorCodes } from 'src/core/errorhandling/exceptions/mti.error-codes.enum';
import { DHCPService } from './dhcp/dhcp.service';
import { EntityManager, EntityRepository, RequestContext } from '@mikro-orm/core';
import { NetworkInterfaceEntity } from './entities/network-interface.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { NetworkConfigService } from './network.config.service';
import { DHCPServerConfigEntity } from './dhcp/entities/dhcp-config.entity';
import { getBroadcast } from './utils/network.helper';

@Injectable()
export class NetworkService implements OnModuleInit {
  private readonly logger = new Logger('NetworkService')

  constructor(private readonly dhcpService: DHCPService, @InjectRepository(NetworkInterfaceEntity)
  private readonly networkRepository: EntityRepository<NetworkInterfaceEntity>, private readonly em: EntityManager, private readonly networkConfig: NetworkConfigService) { }

  async onModuleInit() {
    this.logger.log(`Fetching and synchronising interface-configuration...`);
    await RequestContext.create(this.em, async () => {
      await this.reloadInterfaces();
      await this.dhcpService.reloadAllServers();
    });
  }

  /**
   * Get all interfaces
   */
  getInterfaces(): Promise<NetworkInterfaceEntity[]> {
    return this.networkRepository.findAll();
  }

  /**
   * Retrieves a specific network interface by name
   */
  async getInterface(name: string): Promise<NetworkInterfaceEntity | null> {
    return await this.networkRepository.findOne({ name });
  }


  async updateDHCPConfig(interfaceName: string, dhcpConfig: Partial<ConfigureDHCPDto>): Promise<NetworkInterfaceEntity> {
    const networkInterface = await this.networkRepository.findOne({ name: interfaceName });

    if (!networkInterface) {
      throw new BadRequestMTIException(MTIErrorCodes.UNKNOWN_INTERFACE, 'Cannot configure unknown interface!');
    }

    let newDHCP = networkInterface.dhcpConfig;

    // Create or update DHCP config
    if (!newDHCP) {
      newDHCP = this.em.create(DHCPServerConfigEntity,dhcpConfig);
      newDHCP.interface = networkInterface;
    } else {
      this.em.assign(newDHCP, dhcpConfig);
    }

    const tmpIface = networkInterface.addresses[0];

    newDHCP.dns ??= [tmpIface.address];
    newDHCP.router ??= [tmpIface.address];
    newDHCP.tftpServer ??= this.networkConfig.hostName;
    newDHCP.domainName ??= this.networkConfig.domainName;
    

    networkInterface.dhcpConfig = newDHCP;
    await this.em.persistAndFlush(networkInterface);
    return networkInterface;
  }

  /**
   * Synchronizes database interfaces with system interfaces
   */
  private async syncInterfaces(systemInterfaces: Record<string, NetworkInterface>): Promise<void> {
    const dbInterfaces = await this.em.findAll(NetworkInterfaceEntity, {populate: ['dhcpConfig', 'addresses']});
    const dbInterfaceMap = new Map(dbInterfaces.map(iface => [iface.name, iface]));

    // Handle new and existing interfaces
    for (const [name, sysInterface] of Object.entries(systemInterfaces)) {
      const dbInterface = dbInterfaceMap.get(name);

      if (dbInterface) {
        // Update existing interface
        dbInterface.mac = sysInterface.mac;
        this.em.persist(dbInterface);
      } else {
        // Create new interface
        const newInterface = this.networkRepository.create(sysInterface);
        this.em.persist(newInterface);
      }
    }

    // Mark interfaces as non-existent that are not accessable anymore
    // Do this instead of removing them to keep config
    const removedInterfaces = dbInterfaces.filter(
      iface => !systemInterfaces[iface.name]
    );
    if (removedInterfaces.length > 0) {
      this.em.remove(removedInterfaces);
    }

    await this.em.flush();
  }


  /**
   * Retrieves all network interfaces from the system
   */
  private getSystemInterfaces(): Record<string, NetworkInterface> {
    const interfaces: Record<string, NetworkInterface> = {};
    const systemInterfaces = networkInterfaces();

    for (const [name, addresses] of Object.entries(systemInterfaces)) {
      const filteredAddresses = addresses?.filter(addr => (!this.networkConfig.ipv4Only || addr.family === 'IPv4') && (this.networkConfig.includeInternalNetworks || !addr.internal));

      if (filteredAddresses.length > 0) {
        interfaces[name] = {
          addresses: filteredAddresses,
          // Mac is the same for every address of same interface
          mac: filteredAddresses[0].mac,
          name: name
        }
      }
    }
    return interfaces;
  }

  /**
   * Reloads all network interfaces
   */
  async reloadInterfaces() {
    const systemInterfaces = this.getSystemInterfaces();
    await this.syncInterfaces(systemInterfaces);
  }

  /**
  * Reloads all network interfaces
  */
  async resetInterfaces() {
    await this.networkRepository.nativeDelete({});

    const systemInterfaces = this.getSystemInterfaces();
    await this.syncInterfaces(systemInterfaces);
  }
}