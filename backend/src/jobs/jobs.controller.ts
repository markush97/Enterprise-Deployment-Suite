import { Response } from 'express';
import { UseDeviceTokenGuard } from 'src/auth/decorators/device-token.decorator';
import { Device } from 'src/auth/decorators/device.decorator';
import { Public } from 'src/auth/decorators/public.decorator';
import { DeviceEntity, DeviceType } from 'src/devices/entities/device.entity';

import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CreateJobDto } from './dto/create-job.dto';
import { JobInstructionsDto } from './dto/job-instructions.dto';
import { JobStatusQueryDto } from './dto/job-status.query.dto';
import { JobLogDataDto } from './dto/log-data.dto';
import { RegisterJobDto } from './dto/register-job.dto';
import { TaskInfoDto } from './dto/task-info.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobLogEntity } from './entities/job-log.entity';
import { JobEntity } from './entities/job.entity';
import { JobLogsService } from './job-logs.service';
import { JobsService } from './jobs.service';
import { AccountInfo } from 'src/utils/decorators/auth-user.decorator';
import { AccountEntity } from 'src/auth/entities/account.entity';
import { AuthTokenPayload } from 'src/auth/strategies/jwt/auth-token.interface';

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  private readonly logger = new Logger('Jobs Controller');
  constructor(
    private readonly jobsService: JobsService,
    private readonly jobLogsService: JobLogsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all jobs' })
  @ApiResponse({ status: 200, description: 'Returns all jobs' })
  async findAll(): Promise<JobEntity[]> {
    return this.jobsService.findAll();
  }

  @Get(':id/logs')
  @ApiOperation({ summary: 'Get logs for a job' })
  async getLogsForJob(@Param('id') id: string): Promise<JobLogEntity[]> {
    return this.jobLogsService.getLogsForJob(id);
  }

  @Get(':id/instructions')
  @ApiOperation({ summary: 'Get job instructions' })
  @UseDeviceTokenGuard()
  @ApiResponse({ status: 200, description: 'Returns job instructions' })
  async getJobInstructions(@Param('id') id: string): Promise<JobInstructionsDto> {
    return this.jobsService.getJobInstructions(id);
  }

  @Get(':id/content')
  @ApiOperation({ summary: 'Get job content' })
  @UseDeviceTokenGuard()
  async getJobContent(@Param('id') id: string, @Res({ passthrough: true }) res: Response) {
    this.logger.debug(`Downloading content for job ${id}`);

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=job-content.zip`);

    const stream = await this.jobsService.getJobContent(id);

    stream.pipe(res);
    await stream.finalize();
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
  ): Promise<{ jobId: string; deviceToken: string, jobName?: string }> {
    return this.jobsService.registerJob(RegisterJobDto);
  }


  @Post('notify/:jobid/task/:taskid')
  @UseDeviceTokenGuard()
  @ApiOperation({ summary: 'Notify the server about the current task-status' })
  async taskNotification(@Param('jobid') jobId: string, @Body('taskInfo') taskInfo: TaskInfoDto) {
    return this.jobsService.taskNotification(jobId, taskInfo);
  }

  @Post('notify/:jobid')
  @UseDeviceTokenGuard()
  @ApiOperation({ summary: 'Notify the server about the current setup-status' })
  async clientNotification(@Param('jobid') jobId: string, @Query() jobStatus: JobStatusQueryDto) {
    return this.jobsService.changeStatus(jobId, jobStatus.jobStatus);
  }

  @Post(':jobid/logs')
  @UseDeviceTokenGuard()
  async writeLog(@Param('jobid') jobId: string, @Body() logData: JobLogDataDto, @Device() device: DeviceEntity) {
    return this.jobLogsService.addLog(jobId, logData, device);
  }

  @Put(':jobid/status')
  @ApiOperation({ summary: 'Notify the server about the current setup-status' })
  async statusUpdate(@Param('jobid') jobId: string, @Query() jobStatus: JobStatusQueryDto, @AccountInfo() accountInfo: AuthTokenPayload) {
    console.error(accountInfo)
    return this.jobsService.changeStatus(jobId, jobStatus.jobStatus, accountInfo.sub);
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

  @Put(':id')
  @ApiOperation({ summary: 'Update a job (assign TaskBundle and/or Customer)' })
  @ApiResponse({ status: 200, description: 'Job updated successfully' })
  async updateJob(@Param('id') id: string, @Body() updateInfo: UpdateJobDto): Promise<JobEntity> {
    return this.jobsService.updateJob(id, updateInfo);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a job' })
  @ApiResponse({ status: 200, description: 'Job deleted successfully' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.jobsService.remove(id);
  }
}
