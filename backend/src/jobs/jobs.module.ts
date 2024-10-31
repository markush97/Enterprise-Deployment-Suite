import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { Job } from './entities/job.entity';
import { DevicesModule } from '../devices/devices.module';
import { CustomersModule } from '../customers/customers.module';
import { ImagesModule } from '../images/images.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([Job]),
    DevicesModule,
    CustomersModule,
    ImagesModule,
  ],
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}