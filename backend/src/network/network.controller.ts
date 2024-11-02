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
  async getInterfaces(): Promise<Record<string, NetworkInterface>> {
    return this.networkService.getInterfaces();
  }

  @Post('interfaces/:name/dhcp')
  @ApiOperation({ summary: 'Configure a network interfaces dhcp-server' })
  @ApiResponse({ status: 201, description: 'Network interface succesfully updated' })
  async configureDHCP(@Param('name') interfaceName: string, @Body() dhcpConfig: ConfigureDHCPDto) {
    
  }
}