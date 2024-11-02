import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { CustomersModule } from './customers/customers.module';
import { DevicesModule } from './devices/devices.module';
import { ImagesModule } from './images/images.module';
import { JobsModule } from './jobs/jobs.module';
import { VpnModule } from './vpn/vpn.module';
import { NetworkModule } from './network/network.module';

import config from './mikro-orm.config';
import { CoreConfigModule } from './core/config/core.config.module';
import { StaticFileModule } from './staticFile/static-file.module';
import { PXEModule } from './pxe/pxe.module';
import { CoreLoggingModule } from './core/logging/logging.module';

@Module({
    imports: [
      CoreLoggingModule,
      MikroOrmModule.forRoot(config),
      CustomersModule,
      DevicesModule,
      ImagesModule,
      JobsModule,
      VpnModule,
      NetworkModule,
      CoreConfigModule,
      StaticFileModule,
      PXEModule,

      ],
  })
export class AppModule { }