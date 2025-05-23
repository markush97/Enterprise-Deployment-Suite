import * as os from 'os';

import { Injectable } from '@nestjs/common';

@Injectable()
export class SystemService {
  async getSystemInfo() {
    return {
      version: process.env.npm_package_version || '1.0.0',
      uptime: os.uptime(),
      os: {
        platform: os.platform(),
        release: os.release(),
        version: os.version(),
        arch: os.arch(),
        hostname: os.hostname(),
      },
      memory: {
        total: os.totalmem(),
        used: os.totalmem() - os.freemem(),
        free: os.freemem(),
      },
      cpu: {
        cores: os.cpus().length,
        usage: await this.getCpuUsage(),
        model: os.cpus()[0].model,
      },
      stats: {},
    };
  }

  private async getCpuUsage(): Promise<number> {
    const startMeasure = os.cpus().map(cpu => ({
      idle: cpu.times.idle,
      total: Object.values(cpu.times).reduce((acc, val) => acc + val, 0),
    }));

    await new Promise(resolve => setTimeout(resolve, 100));

    const endMeasure = os.cpus().map(cpu => ({
      idle: cpu.times.idle,
      total: Object.values(cpu.times).reduce((acc, val) => acc + val, 0),
    }));

    const usage = startMeasure.map((start, i) => {
      const end = endMeasure[i];
      const idle = end.idle - start.idle;
      const total = end.total - start.total;
      return (1 - idle / total) * 100;
    });

    return usage.reduce((acc, val) => acc + val, 0) / usage.length;
  }
}
