import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { WinPeConfigService } from './winPe.config.service';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { spawn } from 'child_process';

@Injectable()
export class WinCapturingService {
  constructor(private readonly config: WinPeConfigService) {}

  async initializeCapture(macAddress: string): Promise<string> {
    const sessionId = `capture_${macAddress}_${Date.now()}`;
    const capturePath = join(this.config.captureDirectory, sessionId);
    
    await mkdir(capturePath, { recursive: true });
    await this.generateCaptureConfig(macAddress, sessionId);
    await this.setupWinPE();
    
    return sessionId;
  }

  private async generateCaptureConfig(macAddress: string, sessionId: string) {
    const configContent = `
default capture
timeout 5

label capture
  menu label Capture Windows Image
  kernel /capture/wimcapture/kernel
  append initrd=/capture/wimcapture/initrd.img root=/dev/ram0 rdinit=/sbin/init capture_id=${sessionId} mac=${macAddress}
  ipappend 2`;
    
    const configPath = join('/tmp', `${sessionId}.cfg`);
    await writeFile(configPath, configContent);
  }

  private async setupWinPE() {
    const winPEPath = join('/tmp', 'wimcapture');
    await mkdir(winPEPath, { recursive: true });

    // Hier würden die WinPE-Dateien vorbereitet werden
    // Dies ist ein kritischer Schritt, der die Boot-Umgebung einrichtet
  }

  async startCapture(sessionId: string): Promise<void> {
    const capturePath = join(this.config.captureDirectory, sessionId);
    const imagePath = join(capturePath, 'captured.wim');

    return new Promise((resolve, reject) => {
      const capture = spawn('wimcapture', [
        '--compress=lzx',
        '--boot',
        '/dev/sda1',
        imagePath,
        '--index=1',
        '--check',
        '--no-acl'
      ]);

      let error = '';

      capture.stdout.on('data', (data) => {
        console.log(`Capture progress: ${data}`);
      });

      capture.stderr.on('data', (data) => {
        error += data;
      });

      capture.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Capture failed: ${error}`));
        }
      });
    });
  }

  async getStatus(sessionId: string): Promise<{
    status: 'preparing' | 'capturing' | 'completed' | 'failed';
    progress?: number;
  }> {
    const capturePath = join(this.config.captureDirectory, sessionId);
    const statusFile = join(capturePath, 'status.json');

    try {
      const status = await readFile(statusFile, 'utf8');
      return JSON.parse(status);
    } catch {
      return { status: 'preparing' };
    }
  }
    
}