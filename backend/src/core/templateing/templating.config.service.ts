import { Injectable } from '@nestjs/common';
import { CoreConfigService } from '../config/core.config.service';

@Injectable()
export class TemplatingConfigService {
    constructor(private readonly config: CoreConfigService) {}

    get templateFolder(): string {
        return this.config.get<string>('TEMPLATE_FOLDER', 'templates')
    }
    
}