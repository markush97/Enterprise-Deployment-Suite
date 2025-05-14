import { ConsoleLogger, Injectable } from '@nestjs/common';

@Injectable()
export class CoreLogger extends ConsoleLogger {}
