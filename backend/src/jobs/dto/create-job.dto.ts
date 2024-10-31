import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { JobStatus } from '../entities/job.entity';

export class CreateJobDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  imageId: string;

  @ApiProperty({ enum: JobStatus })
  @IsEnum(JobStatus)
  status: JobStatus = JobStatus.PREPARING;
}