import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseEnumPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { JobEntity, JobStatus } from './entities/job.entity';
import { DeviceType } from 'src/devices/entities/device.entity';
import { RegisterJobDto } from './dto/register-job.dto';
import { TaskInfoDto } from './dto/task-info.dto';
import { IsEnum } from 'class-validator';
import { JobStatusQueryDto } from './dto/job-status.query.dto';
import { AppAuthGuard } from 'src/auth/strategies/jwt/app-auth.guard';
import { Public } from 'src/auth/decorators/public.decorator';
import { UseDeviceTokenGuard } from 'src/auth/decorators/device-token.decorator';

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

  @Post('register')
  @Public()
  @ApiOperation({
    summary: 'Register a new job', description: `This endpoint is used to allow a device register itself to the server to be able to provide informations.
    If the registration is successfull it will return a unique deviceToken that the device can use to update its own information later on. Each serial-Number can only be registered ONCE!`
  })
  @ApiResponse({ status: 201, description: 'Job registered successfully. Returns a device Token ONCE' })
  async register(@Body() RegisterJobDto: RegisterJobDto): Promise<{ jobId: string, deviceToken: string }> {
    return this.jobsService.registerJob(RegisterJobDto);
  }

  @Post('notify/:jobid/task')
  @UseDeviceTokenGuard()
  @ApiOperation({ summary: 'Notify the server about the current task-status' })
  async taskNotification(
    @Param('jobid') jobId: string,
    @Body('taskInfo') taskInfo: TaskInfoDto,
  ) {
    return this.jobsService.taskNotification(jobId, taskInfo);
  }

  @Post('notify/:jobid')
  @UseDeviceTokenGuard()
  @ApiOperation({ summary: 'Notify the server about the current setup-status' })
  async clientNotification(
    @Param('jobid') jobId: string,
    @Query() jobStatus: JobStatusQueryDto,
  ) {
    return this.jobsService.clientNotification(jobId, jobStatus.jobStatus);
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
