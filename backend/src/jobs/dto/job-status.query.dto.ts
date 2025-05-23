import { IsEnum } from 'class-validator';

import { JobStatus } from '../entities/job.entity';

export class JobStatusQueryDto {
  @IsEnum(JobStatus)
  jobStatus: JobStatus;
}
