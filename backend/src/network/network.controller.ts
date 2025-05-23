import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { DHCPService } from './dhcp/dhcp.service';
import { ConfigureDHCPDto } from './dhcp/dto/configure-dhcp.dto';
import { NetworkService } from './network.service';

@ApiTags('network')
@Controller('network')
export class NetworkController {
  constructor(
    private readonly networkService: NetworkService,
    private readonly dhcpService: DHCPService,
  ) {}

  @Get('interfaces')
  @ApiOperation({ summary: 'Get all network interfaces' })
  @ApiResponse({ status: 200, description: 'Returns all network interfaces' })
  async getInterfaces() {
    return this.networkService.getInterfaces();
  }

  @Post('interfaces/reset')
  @ApiOperation({ summary: 'Resets all interfaces' })
  async resetInterfaces() {
    return this.networkService.resetInterfaces();
  }

  @Post('interfaces/reload')
  @ApiOperation({ summary: 'Reloads all interfaces' })
  async reloadInterfaces() {
    return this.networkService.reloadInterfaces();
  }

  @Post('interfaces/:name/dhcp')
  @ApiOperation({ summary: 'Configure a network interfaces dhcp-server' })
  @ApiResponse({ status: 201, description: 'Network interface succesfully updated' })
  async configureDHCP(@Param('name') interfaceName: string, @Body() dhcpConfig: ConfigureDHCPDto) {
    return this.networkService.updateDHCPConfig(interfaceName, dhcpConfig);
  }

  @Post('interfaces/:name/dhcp/reload')
  @ApiOperation({ summary: 'Reload DHCP Server of interface' })
  @ApiResponse({ status: 201, description: 'DHCP Server succesfully restarted' })
  async reloadDhcpByInterfaceName(@Param('name') interfaceName: string) {
    return this.dhcpService.reloadServerByInterfaceName(interfaceName);
  }

  @Post('interfaces/dhcp/reload')
  @ApiOperation({ summary: 'Reload all DHCP Servers' })
  @ApiResponse({ status: 201, description: 'DHCP Server succesfully restarted' })
  async reloadAllDhcp() {
    return this.dhcpService.reloadAllServers();
  }
}
