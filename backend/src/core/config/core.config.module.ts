import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CoreConfigService } from './core.config.service';

/**
 * Global module every App that wants to use any kind of config should import !ONCE!
 * Sets up everything config related, reading config from .env or environment variables (later takes precedence)
 */
@Global()
@Module({
    imports: [
        ConfigModule.forRoot({
            cache: true,
            isGlobal: true,
            expandVariables: true,
        }),
    ],
    controllers: [],
    providers: [CoreConfigService],
    exports: [CoreConfigService],
})
export class CoreConfigModule {}
