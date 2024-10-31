import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { VpnService } from './vpn.service';
import { CreateVpnProfileDto } from './dto/create-vpn-profile.dto';
import { VpnProfile } from './entities/vpn-profile.entity';

@ApiTags('vpn')
@Controller('vpn')
export class VpnController {
  constructor(private readonly vpnService: VpnService) {}

  @Get()
  @ApiOperation({ summary: 'Get all VPN profiles' })
  @ApiResponse({ status: 200, description: 'Returns all VPN profiles' })
  async findAll(): Promise<VpnProfile[]> {
    return this.vpnService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get VPN profile by id' })
  @ApiResponse({ status: 200, description: 'Returns a VPN profile' })
  async findOne(@Param('id') id: string): Promise<VpnProfile> {
    return this.vpnService.findOne(id);
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get VPN profiles by customer' })
  @ApiResponse({ status: 200, description: 'Returns customer VPN profiles' })
  async findByCustomer(@Param('customerId') customerId: string): Promise<VpnProfile[]> {
    return this.vpnService.findByCustomer(customerId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new VPN profile' })
  @ApiResponse({ status: 201, description: 'VPN profile created successfully' })
  async create(@Body() createVpnProfileDto: CreateVpnProfileDto): Promise<VpnProfile> {
    return this.vpnService.create(createVpnProfileDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a VPN profile' })
  @ApiResponse({ status: 200, description: 'VPN profile updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateVpnProfileDto: Partial<CreateVpnProfileDto>,
  ): Promise<VpnProfile> {
    return this.vpnService.update(id, updateVpnProfileDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a VPN profile' })
  @ApiResponse({ status: 200, description: 'VPN profile deleted successfully' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.vpnService.remove(id);
  }

  @Post(':id/test')
  @ApiOperation({ summary: 'Test VPN connection' })
  @ApiResponse({ status: 200, description: 'VPN test completed' })
  async testConnection(@Param('id') id: string): Promise<{ success: boolean; message: string }> {
    return this.vpnService.testConnection(id);
  }
}