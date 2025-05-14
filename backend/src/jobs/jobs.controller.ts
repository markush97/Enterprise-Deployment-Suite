import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { JobEntity, JobStatus } from './entities/job.entity';
import { DeviceType } from 'src/devices/entities/device.entity';

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) { }

  @Get()
  @ApiOperation({ summary: 'Get all jobs' })
  @ApiResponse({ status: 200, description: 'Returns all jobs' })
  async findAll(): Promise<JobEntity[]> {
    return this.jobsService.findAll();
  }

  @Get('notify/:mac/:clientIp')
  @ApiOperation({ summary: 'Notify the server about a pxe-connection' })
  async clientPxeNotification(@Param('mac') clientMac?: string, @Param('clientIp') clientIp?: string, @Query('clientPlatform') clientPlatform?: "UEFI" | "PC") {
    return this.jobsService.clientPxeNotification({ clientIp, clientMac, clientPlatform });
  }

  @Post('notify/:jobid')
  @ApiOperation({ summary: 'Notify the server about the current device-status' })
  async clientNotification(
    @Param('jobid') jobId: string,
    @Query('jobStatus') jobStatus: JobStatus,
  ) {
    return this.jobsService.clientNotification(jobId, jobStatus);
  }

  @Get('mac/:mac')
  @ApiOperation({ summary: 'Get a job-ID by client mac' })
  async getJobIdByMac(@Param('mac') clientMac: string) {
    return this.jobsService.getJobIDByMac(clientMac);
  }

  @Get('mac/:mac/config')
  @ApiOperation({ summary: 'Get a clientConfig by client mac' })
  async getClientConfigByMac(@Param('mac') clientMac: string) {
    return this.jobsService.getJobConfigByMac(clientMac);
  }


  @Get('setupBundle/:mac/:clientIp/bundle')
  @ApiOperation({ summary: 'Notify the server about a pxe-connection' })
  async getClientSetupBundle(@Param('mac') clientMac?: string, @Param('clientIp') clientIp?: string, @Query('clientPlatform') clientPlatform?: "UEFI" | "PC") {
    return this.jobsService.clientPxeNotification({ clientIp, clientMac, clientPlatform });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job by id' })
  @ApiResponse({ status: 200, description: 'Returns a job' })
  async findOne(@Param('id') id: string): Promise<JobEntity> {
    return this.jobsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new job' })
  @ApiResponse({ status: 201, description: 'Job created successfully' })
  async create(@Body() createJobDto: CreateJobDto): Promise<JobEntity> {
    return this.jobsService.create(createJobDto);
  }

  @Post(':id/device/autocreate')
  @ApiOperation({ summary: 'Create a new device for a job' })
  @ApiResponse({ status: 200, description: 'Device created successfully' })
  async createDeviceForJob(
    @Param('id') id: string,
    @Query('type') deviceType: DeviceType) {
    return this.jobsService.createDeviceForJobAutomatically(id, deviceType);
  }

  @Put(':id/customer/:customerId')
  @ApiOperation({ summary: 'Assign a customer to a job' })
  @ApiResponse({ status: 200, description: 'Customer assigned successfully' })
  async assignCustomerToJob(
    @Param('id') id: string,
    @Param('customerId') customerId: string,
  ): Promise<JobEntity> {
    return this.jobsService.assignJobToCustomer(id, customerId);

  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a job' })
  @ApiResponse({ status: 200, description: 'Job deleted successfully' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.jobsService.remove(id);
  }
}
