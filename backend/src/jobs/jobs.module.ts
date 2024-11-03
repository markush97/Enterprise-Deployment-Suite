import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { JobEntity } from './entities/job.entity';
import { DevicesModule } from '../devices/devices.module';
import { CustomersModule } from '../customers/customers.module';
import { ImagesModule } from '../images/images.module';
import { JobConnectionsEntity } from './entities/job-connections.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([JobEntity, JobConnectionsEntity]),
    DevicesModule,
    CustomersModule,
    ImagesModule,
  ],
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}