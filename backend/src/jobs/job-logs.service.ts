import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { JobEntity } from './entities/job.entity';
import { JobLogEntity } from './entities/job-log.entity';
import { DeviceEntity } from 'src/devices/entities/device.entity';
import { JobLogDataDto } from './dto/log-data.dto';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/mssql';
import { JobsService } from './jobs.service';
import { BadRequestMTIException } from 'src/core/errorhandling/exceptions/bad-request.mti-exception';
import { MTIErrorCodes } from 'src/core/errorhandling/exceptions/mti.error-codes.enum';
import { TasksEntity } from 'src/tasks/entities/task.entity';


@Injectable()
export class JobLogsService {
  constructor(private readonly em: EntityManager, @InjectRepository(JobLogEntity)
      private readonly jobLogRepository: EntityRepository<JobLogEntity>, private readonly jobService: JobsService) {}

  async addLog(log: JobLogDataDto, device: DeviceEntity): Promise<JobLogEntity> {
    const job = await this.jobService.findOneOrFail(log.jobId);

    if (job.device.id !== device.id) {
        throw new BadRequestMTIException(MTIErrorCodes.JOB_LOG_DEVICE_MISMATCH,
          `Job with ID ${log.jobId} is not associated with device ${device.id}.`);
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
    return this.jobLogRepository.findAll({filters: { job: {id: jobId} }, orderBy: { timestamp: 'ASC' } });
  }
}
