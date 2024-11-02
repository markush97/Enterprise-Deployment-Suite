import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NetworkService } from './network.service';
import * as os from 'os';


@ApiTags('network')
@Controller('network')
export class NetworkController {
  constructor(private readonly networkService: NetworkService) {}

  @Get('interfaces')
  @ApiOperation({ summary: 'Get all network interfaces' })
  @ApiResponse({ status: 200, description: 'Returns all network interfaces' })
  async getInterfaces(): Promise<NodeJS.Dict<os.NetworkInterfaceInfo[]>> {
    return this.networkService.getInterfaces();
  }
}