import { TaskModule } from 'src/tasks/task.module';

import { Module } from '@nestjs/common';

import { MikroOrmModule } from '@mikro-orm/nestjs';

import { CustomersModule } from '../customers/customers.module';
import { DevicesModule } from '../devices/devices.module';
import { ImagesModule } from '../images/images.module';
import { JobConnectionsEntity } from './entities/job-connections.entity';
import { JobLogEntity } from './entities/job-log.entity';
import { JobEntity } from './entities/job.entity';
import { JobLogsService } from './job-logs.service';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([JobEntity, JobConnectionsEntity, JobLogEntity]),
    DevicesModule,
    CustomersModule,
    ImagesModule,
    TaskModule,
  ],
  controllers: [JobsController],
  providers: [JobsService, JobLogsService],
  exports: [JobsService],
})
export class JobsModule {}
