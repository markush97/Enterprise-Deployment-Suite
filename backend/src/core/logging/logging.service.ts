import { ConsoleLogger, Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class CoreLogger extends ConsoleLogger {
    
    
}