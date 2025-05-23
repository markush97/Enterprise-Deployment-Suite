import { Server as DHCPServer, ServerConfig, addOption, createServer } from 'dhcp';
import { promisify } from 'util';

import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';

import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';

import { DHCPConfigService } from './dhcp.config.service';
import { DHCPBootFilesEntity, DHCPServerConfigEntity } from './entities/dhcp-config.entity';

@Injectable()
export class DHCPService implements OnModuleDestroy {
  private readonly logger = new Logger('DHCPService');
  private dhcpServers: Record<string, DHCPServer> = {};

  constructor(
    private readonly dhcpConfig: DHCPConfigService,
    @InjectRepository(DHCPServerConfigEntity)
    private readonly dhcpRepository: EntityRepository<DHCPServerConfigEntity>,
  ) {
    // Add DHCP-Options to the global DHCP service
    addOption(93, {
      config: 'clientSystemArchitecture',
      type: 'ASCII',
      name: 'Client System Architecture',
    });
    addOption(94, {
      config: 'clientNetworkDeviceInterface',
      type: 'ASCII',
      name: 'Client Network Device Interface',
    });
    addOption(97, {
      config: 'UUID',
      type: 'ASCII',
      name: 'uuid',
    });
    addOption(128, {
      config: 'Call Server Information',
      type: 'ASCII',
      name: 'callServer',
    });
    addOption(129, {
      config: 'Voice VLan',
      type: 'ASCII',
      name: 'voiceVlan',
    });
    addOption(130, {
      config: 'Phone Model',
      type: 'ASCII',
      name: 'phoneModel',
    });
    addOption(131, {
      config: 'Remote Statistics Server IP Address',
      type: 'ASCII',
      name: 'statisticsServer',
    });
    addOption(132, {
      config: 'default VLAN Id',
      type: 'ASCII',
      name: 'vlanId',
    });
    addOption(133, {
      config: 'Priority Class',
      type: 'ASCII',
      name: 'priorityClass',
    });
    addOption(134, {
      config: 'Diffserv Code Point',
      type: 'ASCII',
      name: 'dscp',
    });
    addOption(135, {
      config: 'dns suffix',
      type: 'ASCII',
      name: 'dnsSuffix',
    });
  }

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
      this.startServer(dhcpConfig.interface.name);
    }
  }

  async startServer(interfaceName: string) {
    this.logger.log(`DHCPServer on ${interfaceName} starting...`);
    if (!this.dhcpServers[interfaceName]) {
      this.logger.error(
        `DHCPServer on ${interfaceName} needs to be initialized before it can be started!`,
      );
      return;
    }

    this.dhcpServers[interfaceName].listen(this.dhcpConfig.port);
  }

  async stopServer(interfaceName: string) {
    if (this.dhcpServers[interfaceName]) {
      this.logger.log(`DHCPServer on ${interfaceName} stopping...`);
      return promisify(this.dhcpServers[interfaceName].close);
    }
  }

  private async initializeServer(dhcpConfig: DHCPServerConfigEntity) {
    const interfaceAddress = dhcpConfig.interface.addresses[0];

    const mergedConfig: ServerConfig = {
      ...dhcpConfig,
      bootFile: getBootFile(dhcpConfig.bootFiles),
      forceOptions: ['hostname', 'domainName', 'tftpServer'],
      server: interfaceAddress.address,
      randomIP: false,
      // static: () =>  "10.119.33.125"
    };

    const dhcpServer = createServer(mergedConfig);
    dhcpServer.on('message', request => {
      this.logger.debug(`Request from client: ${JSON.stringify(request)}`);
    });

    dhcpServer.on('bound', lease => {
      this.logger.debug(`Bound client ${JSON.stringify(lease)}`);
    });

    this.dhcpServers[dhcpConfig.interface.name] = dhcpServer;
  }

  async stopAllServers() {
    this.logger.log(`Shutting down all dhcp services...`);
    const promises = Object.values(this.dhcpServers).map(server => promisify(server.close));
    await Promise.all(promises);
    this.logger.log(`Shutdown of DHCP-Servers done!`);
  }

  private async getConfigByInterface(interfaceName: string): Promise<DHCPServerConfigEntity> {
    return this.dhcpRepository.findOne({ interface: { name: interfaceName } });
  }
}

const getBootFile = (bootFiles: DHCPBootFilesEntity) => {
  return request => {
    // Extract architecture from DHCP options
    const archOption = request[93];
    const arch = archOption ? archOption[1] : null;

    // Architecture codes (IANA)
    const ARCH = {
      ARM64_UEFI: 0x0b, // ARM64 UEFI
      X86_UEFI: 0x06, // x86 UEFI
      X86_64_UEFI: 0x07, // x86-64 UEFI
      X86_BIOS: 0x00, // x86 BIOS
    };

    console.log(arch);

    // Boot file paths
    switch (arch) {
      case ARCH.ARM64_UEFI:
        return bootFiles.efiARMx64;

      case ARCH.X86_UEFI:
        return bootFiles.efiAMDx86;

      case ARCH.X86_BIOS:
        // Legacy BIOS boot
        return bootFiles.bios;

      case ARCH.X86_64_UEFI:
      default:
        return bootFiles.efiAMDx64;
    }
  };
};
