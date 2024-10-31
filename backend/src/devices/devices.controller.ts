import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { Device } from './entities/device.entity';

@ApiTags('devices')
@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all devices' })
  @ApiResponse({ status: 200, description: 'Returns all devices' })
  async findAll(): Promise<Device[]> {
    return this.devicesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get device by id' })
  @ApiResponse({ status: 200, description: 'Returns a device' })
  async findOne(@Param('id') id: string): Promise<Device> {
    return this.devicesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new device' })
  @ApiResponse({ status: 201, description: 'Device created successfully' })
  async create(@Body() createDeviceDto: CreateDeviceDto): Promise<Device> {
    return this.devicesService.create(createDeviceDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a device' })
  @ApiResponse({ status: 200, description: 'Device updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateDeviceDto: Partial<CreateDeviceDto>,
  ): Promise<Device> {
    return this.devicesService.update(id, updateDeviceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a device' })
  @ApiResponse({ status: 200, description: 'Device deleted successfully' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.devicesService.remove(id);
  }
}