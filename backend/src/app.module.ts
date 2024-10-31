import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { LoggerModule } from 'nestjs-pino';

import { CustomersModule } from './customers/customers.module';
import { DevicesModule } from './devices/devices.module';
import { ImagesModule } from './images/images.module';
import { JobsModule } from './jobs/jobs.module';
import { VpnModule } from './vpn/vpn.module';
import { NetworkModule } from './network/network.module';

import config from './mikro-orm.config';
import { CoreConfigModule } from './core/config/core.config.module';

@Module({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
      }),
      LoggerModule.forRoot({
        pinoHttp: {
          transport: {
            target: 'pino-pretty',
            options: {
              colorize: true,
              levelFirst: true,
              translateTime: true,
            },
          },
        },
      }),
      MikroOrmModule.forRoot(config),
      CustomersModule,
      DevicesModule,
      ImagesModule,
      JobsModule,
      VpnModule,
      NetworkModule,
      CoreConfigModule
      ],
  })
export class AppModule { }