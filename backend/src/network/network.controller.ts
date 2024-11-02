import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NetworkService } from './network.service';
import { NetworkInterface } from './networkInterface.interface';


@ApiTags('network')
@Controller('network')
export class NetworkController {
  constructor(private readonly networkService: NetworkService) {}

  @Get('interfaces')
  @ApiOperation({ summary: 'Get all network interfaces' })
  @ApiResponse({ status: 200, description: 'Returns all network interfaces' })
  async getInterfaces(@Query('internal') includeInternalInterfaces?: string): Promise<NetworkInterface[]> {
    return this.networkService.getInterfaces(!!includeInternalInterfaces);
  }
}