import { Global, Module } from '@nestjs/common';

import { CoreLogger } from './logging.service';

@Global()
@Module({
  imports: [
    /* LoggerModule.forRoot({
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
    })*/
  ],
  controllers: [],
  providers: [CoreLogger],
})
export class CoreLoggingModule {}
