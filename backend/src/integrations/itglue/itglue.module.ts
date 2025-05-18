import { Module } from '@nestjs/common';
import { ITGlueService } from './itglue.service';
import { ITGlueConfigService } from './itglue.config.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { CoreConfigService } from 'src/core/config/core.config.service';
import { CoreConfigModule } from 'src/core/config/core.config.module';


@Module({
    imports: [HttpModule.registerAsync({
        imports: [],
        useClass: ITGlueConfigService,
    })],
    controllers: [],
    providers: [ITGlueService, ITGlueConfigService],
    exports: [ITGlueService],
})
export class ITGlueModule { };
