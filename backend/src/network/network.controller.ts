import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NetworkService } from './network.service';
import { NetworkInterface } from './networkInterface.interface';
import { ConfigureDHCPDto } from './dhcp/dto/configure-dhcp.dto';


@ApiTags('network')
@Controller('network')
export class NetworkController {
  constructor(private readonly networkService: NetworkService) {}

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

}