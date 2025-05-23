import { ITGlueModule } from 'src/integrations/itglue/itglue.module';

import { Module } from '@nestjs/common';

import { MikroOrmModule } from '@mikro-orm/nestjs';

import { CustomersModule } from '../customers/customers.module';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { DeviceEntity } from './entities/device.entity';

@Module({
  imports: [MikroOrmModule.forFeature([DeviceEntity]), CustomersModule, ITGlueModule],
  controllers: [DevicesController],
  providers: [DevicesService],
  exports: [DevicesService],
})
export class DevicesModule {}
