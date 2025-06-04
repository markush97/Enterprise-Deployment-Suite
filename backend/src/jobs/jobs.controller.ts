import { UseDeviceTokenGuard } from 'src/auth/decorators/device-token.decorator';
import { Public } from 'src/auth/decorators/public.decorator';
import { DeviceEntity, DeviceType } from 'src/devices/entities/device.entity';

import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CreateJobDto } from './dto/create-job.dto';
import { JobStatusQueryDto } from './dto/job-status.query.dto';
import { RegisterJobDto } from './dto/register-job.dto';
import { TaskInfoDto } from './dto/task-info.dto';
import { JobEntity } from './entities/job.entity';
import { JobsService } from './jobs.service';
import { Device } from 'src/auth/decorators/device.decorator';
import { JobInstructionsDto } from './dto/job-instructions.dto';
import { JobLogDataDto } from './dto/log-data.dto';
import { JobLogsService } from './job-logs.service';

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService, private readonly jobLogsService: JobLogsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all jobs' })
  @ApiResponse({ status: 200, description: 'Returns all jobs' })
  async findAll(): Promise<JobEntity[]> {
    return this.jobsService.findAll();
  }

  @Get(':id/instructions')
  @ApiOperation({ summary: 'Get job instructions' })
  @UseDeviceTokenGuard()
  @ApiResponse({ status: 200, description: 'Returns job instructions' })
  async getJobInstructions(@Param('id') id: string): Promise<JobInstructionsDto> {
    return this.jobsService.getJobInstructions(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job by id' })
  @ApiResponse({ status: 200, description: 'Returns a job' })
  async findOne(@Param('id') id: string): Promise<JobEntity> {
    return this.jobsService.findOneOrFail(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new job' })
  @ApiResponse({ status: 201, description: 'Job created successfully' })
  async create(@Body() createJobDto: CreateJobDto): Promise<JobEntity> {
    return this.jobsService.create(createJobDto);
  }

  @Post('register')
  @Public()
  @ApiOperation({
    summary: 'Register a new job',
    description: `This endpoint is used to allow a device register itself to the server to be able to provide informations.
    If the registration is successfull it will return a unique deviceToken that the device can use to update its own information later on. Each serial-Number can only be registered ONCE!`,
  })
  @ApiResponse({
    status: 201,
    description: 'Job registered successfully. Returns a device Token ONCE',
  })
  async register(
    @Body() RegisterJobDto: RegisterJobDto,
  ): Promise<{ jobId: string; deviceToken: string }> {
    return this.jobsService.registerJob(RegisterJobDto);
  }

  @Post('notify/:jobid/task/:taskid')
  @UseDeviceTokenGuard()
  @ApiOperation({ summary: 'Notify the server about the current task-status' })
  async taskNotification(@Param('jobid') jobId: string, @Body('taskInfo') taskInfo: TaskInfoDto) {
    return this.jobsService.taskNotification(jobId, taskInfo);
  }

  @Post('logs')
  @UseDeviceTokenGuard()
  async writeLog(@Body() logData: JobLogDataDto, @Device() device: DeviceEntity) {
    return this.jobLogsService.addLog(logData, device);
  }

  @Post('notify/:jobid')
  @UseDeviceTokenGuard()
  @ApiOperation({ summary: 'Notify the server about the current setup-status' })
  async clientNotification(@Param('jobid') jobId: string, @Query() jobStatus: JobStatusQueryDto) {
    return this.jobsService.clientNotification(jobId, jobStatus.jobStatus);
  }

  @Post(':id/device/autocreate')
  @ApiOperation({ summary: 'Create a new device for a job' })
  @ApiResponse({ status: 200, description: 'Device created successfully' })
  async createDeviceForJob(@Param('id') id: string, @Query('type') deviceType: DeviceType) {
    return this.jobsService.createDeviceForJobAutomatically(id, deviceType);
  }

  @Put(':jobid/status')
  @ApiOperation({ summary: 'Notify the server about the current setup-status' })
  async statusUpdate(@Param('jobid') jobId: string, @Query() jobStatus: JobStatusQueryDto) {
    return this.jobsService.clientNotification(jobId, jobStatus.jobStatus);
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
