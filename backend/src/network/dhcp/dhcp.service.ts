import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { DHCPConfigService } from './dhcp.config.service';
import { DHCPOptions, Server as DHCPServer, ServerConfig } from 'dhcp'
import { promisify } from 'util';
import { DHCPServerConfigEntity } from './entities/dhcp-config.entity';
import { NetworkInterface } from '../networkInterface.interface';
import { getBroadcast } from '../utils/network.helper';
import { ConfigureDHCPDto } from './dto/configure-dhcp.dto';

@Injectable() 
export class DHCPService implements OnModuleDestroy {
    private readonly logger = new Logger('DHCPService');
    private dhcpServers: Record<string, DHCPServer>;

    private readonly getClientIp = (macAddress: string) => "10.123.0.100"; 

    constructor(private readonly dhcpConfig: DHCPConfigService) {}

    async onModuleInit() {
      
    }

    async onModuleDestroy() {
      await this.shutdownServers();
    }

    async startServer(interfaceName: string) {
      this.logger.log(`DHCPServer on ${interfaceName} starting...`);
      if (!this.dhcpServers[interfaceName]) {
        this.logger.error(`DHCPServer on ${interfaceName} needs to be initialized before it can be started!`);
        return;
      }

      this.dhcpServers[interfaceName].listen();
    }

    async stopServer(interfaceName: string) {
      this.logger.log(`DHCPServer on ${interfaceName} stopping...`);
      if (this.dhcpServers[interfaceName]) {
        return promisify(this.dhcpServers[interfaceName].close)
      }
    }

    async initializeServer(iface: NetworkInterface, serverConfig: ConfigureDHCPDto) {
      const interfaceAddress = iface.addresses[0];

      const mergedConfig: ServerConfig = {
        ...serverConfig,
        server: interfaceAddress.address,
        broadcast: getBroadcast(interfaceAddress.address, interfaceAddress.netmask),
        randomIP: false,
        static: this.getClientIp,
        bootFile: function(req, res) {

          // res.ip - the actual ip allocated for the client
      
          if (req.clientId === 'foo bar') {
            return 'x86linux.0';
          } else {
            return 'x64linux.0';
          }
        }
      }

      const dhcpServer = new DHCPServer(mergedConfig);
      this.dhcpServers[iface.name] = dhcpServer;

    }

    async shutdownServers() {
      this.logger.log(`Shutting down all dhcp services...`)
      const promises = Object.values(this.dhcpServers).map(server => promisify(server.close));
      await Promise.all(promises);
      this.logger.log(`Shutdown of DHCP-Servers done!`)
    }
}

/**
 * 
 * var s = dhcp.createServer({
  // System settings
  range: [
    "192.168.3.10", "192.168.3.99"
  ],
  forceOptions: ['hostname'], // Options that need to be sent, even if they were not requested
  randomIP: true, // Get random new IP from pool instead of keeping one ip
  static: {
    "11:22:33:44:55:66": "192.168.3.100"
  },

  // Option settings (there are MUCH more)
  netmask: '255.255.255.0',
  router: [
    '192.168.0.1'
  ],
  dns: ["8.8.8.8", "8.8.4.4"],
  hostname: "kacknup",
  broadcast: '192.168.0.255',
  server: '192.168.0.1', // This is us
  bootFile: function (req, res) {

    // res.ip - the actual ip allocated for the client

    if (req.clientId === 'foo bar') {
      return 'x86linux.0';
    } else {
      return 'x64linux.0';
    }
  }
});

s.listen();
 */