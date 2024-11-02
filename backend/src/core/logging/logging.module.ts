import { Global, Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';

@Global()
@Module({
    imports: [
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
    })
    ],
    controllers: [],
    providers: []
})
export class CoreLoggingModule { };