import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { CustomersModule } from './customers/customers.module';
import { DevicesModule } from './devices/devices.module';
import { ImagesModule } from './images/images.module';
import { JobsModule } from './jobs/jobs.module';
import { VpnModule } from './vpn/vpn.module';
import { NetworkModule } from './network/network.module';

import { CoreConfigModule } from './core/config/core.config.module';
import { StaticFileModule } from './staticFile/static-file.module';
import { PXEModule } from './pxe/pxe.module';
import { CoreLoggingModule } from './core/logging/logging.module';
import { CorePersistenceModule } from './core/persistence/core-persistence.module';
import { ITGlueConfigService } from './integrations/itglue/itglue.config.service';
import { ITGlueModule } from './integrations/itglue/itglue.module';
import { EMailModule } from './core/email/email.module';
import { SystemModule } from './core/system/system.module';

@Module({
  imports: [
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
    ITGlueModule
  ],
})
export class AppModule { }
