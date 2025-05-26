import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { AuthModule } from './auth/auth.module';
import { CoreConfigModule } from './core/config/core.config.module';
import { EMailModule } from './core/email/email.module';
import { CoreLoggingModule } from './core/logging/logging.module';
import { CorePersistenceModule } from './core/persistence/core-persistence.module';
import { SystemModule } from './core/system/system.module';
import { CustomersModule } from './customers/customers.module';
import { DevicesModule } from './devices/devices.module';
import { ImagesModule } from './images/images.module';
import { ITGlueModule } from './integrations/itglue/itglue.module';
import { JobsModule } from './jobs/jobs.module';
import { NetworkModule } from './network/network.module';
import { PXEModule } from './pxe/pxe.module';
import { StaticFileModule } from './staticFile/static-file.module';
import { TaskModule } from './tasks/task.module';
import { UserModule } from './users/user.module';
import { VpnModule } from './vpn/vpn.module';

@Module({
  imports: [
    UserModule,
    CoreLoggingModule,
    SystemModule,
    EMailModule,
    CustomersModule,
    DevicesModule,
    ImagesModule,
    JobsModule,
    VpnModule,
    NetworkModule,
    CoreConfigModule,
    StaticFileModule,
    PXEModule,
    NetworkModule,
    CorePersistenceModule,
    ITGlueModule,
    AuthModule,
    TaskModule,
    PassportModule.register({}),
  ],
})
export class AppModule {}
