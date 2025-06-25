import { BadRequestMTIException } from 'src/core/errorhandling/exceptions/bad-request.mti-exception';
import { MTIErrorCodes } from 'src/core/errorhandling/exceptions/mti.error-codes.enum';
import { DeviceEntity } from 'src/devices/entities/device.entity';
import { TasksEntity } from 'src/tasks/entities/task.entity';

import { Injectable, Logger } from '@nestjs/common';

import { EntityManager } from '@mikro-orm/core';
import { EntityRepository } from '@mikro-orm/mssql';
import { InjectRepository } from '@mikro-orm/nestjs';

import { JobLogDataDto } from './dto/log-data.dto';
import { JobLogEntity } from './entities/job-log.entity';
import { JobEntity } from './entities/job.entity';
import { JobsService } from './jobs.service';

@Injectable()
export class JobLogsService {
  private readonly logger = new Logger('JobLogsService');
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(JobLogEntity)
    private readonly jobLogRepository: EntityRepository<JobLogEntity>,
    private readonly jobService: JobsService,
  ) {}

  async addLog(jobId: string, log: JobLogDataDto, device: DeviceEntity): Promise<JobLogEntity> {
    const job = await this.jobService.findOneOrFail(jobId);

    if (job.device.id !== device.id) {
      throw new BadRequestMTIException(
        MTIErrorCodes.JOB_LOG_DEVICE_MISMATCH,
        `Job with ID ${jobId} is not associated with device ${device.id}.`,
      );
    }

    const jobLog = this.jobLogRepository.create({
      job,
      timestamp: new Date(log.timestamp),
      message: log.message,
      meta: log.meta,
      device: device,
      task: log.taskId ? this.em.getReference(TasksEntity, log.taskId) : undefined,
    });

    await this.em.persistAndFlush(jobLog);
    return jobLog;
  }

  async getLogsForJob(jobId: string): Promise<JobLogEntity[]> {
    this.logger.debug(`Fetching logs for job with ID: ${jobId}`);
    return this.jobLogRepository.findAll({
      where: { job: this.jobLogRepository.getReference(jobId) },
      orderBy: { timestamp: 'ASC' },
    });
  }
}
