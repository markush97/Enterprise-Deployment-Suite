import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { Job } from './entities/job.entity';

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all jobs' })
  @ApiResponse({ status: 200, description: 'Returns all jobs' })
  async findAll(): Promise<Job[]> {
    return this.jobsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job by id' })
  @ApiResponse({ status: 200, description: 'Returns a job' })
  async findOne(@Param('id') id: string): Promise<Job> {
    return this.jobsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new job' })
  @ApiResponse({ status: 201, description: 'Job created successfully' })
  async create(@Body() createJobDto: CreateJobDto): Promise<Job> {
    return this.jobsService.create(createJobDto);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update job status' })
  @ApiResponse({ status: 200, description: 'Job status updated successfully' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ): Promise<Job> {
    return this.jobsService.updateStatus(id, status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a job' })
  @ApiResponse({ status: 200, description: 'Job deleted successfully' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.jobsService.remove(id);
  }
}