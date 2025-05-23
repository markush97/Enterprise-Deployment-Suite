import { Eta } from 'eta';
import path from 'path';

import { Injectable, OnModuleInit } from '@nestjs/common';

import { TemplatingConfigService } from './templating.config.service';

@Injectable()
export class CoreTemplatingService implements OnModuleInit {
  private eta: Eta;

  constructor(private readonly templateConfig: TemplatingConfigService) {}

  onModuleInit() {
    this.eta = new Eta({ views: path.resolve(__dirname, this.templateConfig.templateFolder) });
  }

  render(template: string, data: Record<string, unknown>): string {
    return this.eta.render(template, data);
  }
}
