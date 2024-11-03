import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { DHCPConfigService } from './dhcp.config.service';
import { DHCPOptions, createServer, ServerConfig, Server as DHCPServer } from 'dhcp'
import { promisify } from 'util';
import { DHCPServerConfigEntity } from './entities/dhcp-config.entity';
import { NetworkInterface } from '../networkInterface.interface';
import { getBroadcast } from '../utils/network.helper';
import { ConfigureDHCPDto } from './dto/configure-dhcp.dto';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';

@Injectable()
export class DHCPService implements OnModuleDestroy {
  private readonly logger = new Logger('DHCPService');
  private dhcpServers: Record<string, DHCPServer> = {};

  private readonly getClientIp = (macAddress: string) => "10.123.0.100";

  constructor(private readonly dhcpConfig: DHCPConfigService, @InjectRepository(DHCPServerConfigEntity) private readonly dhcpRepository: EntityRepository<DHCPServerConfigEntity>) { }

  async onModuleDestroy() {
    await this.stopAllServers();
  }

  async reloadServerByInterfaceName(interfaceName: string) {
    const dhcpConfig = await this.getConfigByInterface(interfaceName);
    await this.reloadServer(dhcpConfig);
  }

  async reloadAllServers() {
    const dhcpConfigs = await this.dhcpRepository.findAll();

    for (const config of dhcpConfigs) {
      await this.reloadServer(config);
    }
  }

  private async reloadServer(dhcpConfig: DHCPServerConfigEntity) {
    await this.stopServer(dhcpConfig.interface.name);
    await this.initializeServer(dhcpConfig);
    
    if (dhcpConfig.active) {
      this.startServer(dhcpConfig.interface.name)
    }
  }

  async startServer(interfaceName: string) {
    this.logger.log(`DHCPServer on ${interfaceName} starting...`);
    if (!this.dhcpServers[interfaceName]) {
      this.logger.error(`DHCPServer on ${interfaceName} needs to be initialized before it can be started!`);
      return;
    }

    this.dhcpServers[interfaceName].listen(6868);
  }

  async stopServer(interfaceName: string) {
    if (this.dhcpServers[interfaceName]) {
      this.logger.log(`DHCPServer on ${interfaceName} stopping...`);
      return promisify(this.dhcpServers[interfaceName].close)
    }
  }

  private async initializeServer(dhcpConfig: DHCPServerConfigEntity) {
    const interfaceAddress = dhcpConfig.interface.addresses[0];

    const mergedConfig: ServerConfig = {
      ...dhcpConfig,
      server: interfaceAddress.address,
      broadcast: getBroadcast(interfaceAddress.address, interfaceAddress.netmask),
      randomIP: false,
      static: this.getClientIp,
      bootFile: function (req, res) {

        // res.ip - the actual ip allocated for the client
        if (req.clientId === 'foo bar') {
          return 'x86linux.0';
        } else {
          return 'x64linux.0';
        }
      }
    }

    const dhcpServer = createServer(mergedConfig);
    this.dhcpServers[dhcpConfig.interface.name] = dhcpServer;
  }

  async stopAllServers() {
    this.logger.log(`Shutting down all dhcp services...`)
    const promises = Object.values(this.dhcpServers).map(server => promisify(server.close));
    await Promise.all(promises);
    this.logger.log(`Shutdown of DHCP-Servers done!`)
  }

  private async getConfigByInterface(interfaceName: string): Promise<DHCPServerConfigEntity> {
    return this.dhcpRepository.findOne({interface: {name: interfaceName}});
  }
}