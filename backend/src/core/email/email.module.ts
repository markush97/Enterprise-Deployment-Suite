import { Global, Module } from '@nestjs/common';
import { EMailService } from './email.service';
import { EMailConfigService } from './email.config.service';

@Global()
@Module({
    imports: [],
    providers: [EMailService, EMailConfigService],
    exports: [EMailService],
})
export class EMailModule { }
