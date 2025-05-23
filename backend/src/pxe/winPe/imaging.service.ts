import { spawn } from 'child_process';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

import { Injectable } from '@nestjs/common';

@Injectable()
export class WinImagingService {
  private readonly winPERoot = join(process.cwd(), 'tftp-root', 'capture', 'winpe');
  private readonly toolsDir = join(this.winPERoot, 'tools');

  async setupWinPE() {
    await this.createDirectoryStructure();
    await this.generateWinPEConfig();
    await this.setupCaptureScript();
  }

  private async createDirectoryStructure() {
    const dirs = [
      this.winPERoot,
      this.toolsDir,
      join(this.winPERoot, 'mount'),
      join(this.winPERoot, 'scripts'),
    ];

    for (const dir of dirs) {
      await mkdir(dir, { recursive: true });
    }
  }

  private async generateWinPEConfig() {
    const configContent = `
  [WinPE]
  Architecture=amd64
  Language=en-US
  Components=WinPE-WMI,WinPE-NetFX,WinPE-PowerShell,WinPE-DismCmdlets
  ExtraDrivers=network,storage
  CustomFiles=${this.toolsDir}
  `;
    await writeFile(join(this.winPERoot, 'winpe.ini'), configContent);
  }

  private async setupCaptureScript() {
    const sourceVolume = 'xy';
    const scriptContent = `
  # WinPE Capture Script
  $ErrorActionPreference = "Stop"
  
  # Initialisiere Netzwerk
  Start-Sleep -Seconds 10
  ipconfig /renew
  
  # Hole Parameter vom TFTP-Server
  $captureConfig = Get-Content "X:\\capture_config.ini"
  $serverIP = $captureConfig | Where-Object { $_ -match "^ServerIP=" } | ForEach-Object { $_ -replace "^ServerIP=",'' }
  $captureId = $captureConfig | Where-Object { $_ -match "^CaptureID=" } | ForEach-Object { $_ -replace "^CaptureID=",'' }
  
  # Erstelle temporäres Verzeichnis
  New-Item -ItemType Directory -Path "X:\\temp" -Force
  
  # Starte Capture-Prozess
  $sourceVolume = Get-Volume | Where-Object { $_.FileSystemLabel -eq "Windows" } | Select-Object -ExpandProperty DriveLetter
  if (-not $sourceVolume) {
      Write-Error "Windows-Volume nicht gefunden!"
      exit 1
  }
  
  Write-Host "Starte Image-Capture von Laufwerk $sourceVolume..."
  
  # Capture mit DISM
  $imagePath = "X:\\temp\\capture.wim"
  dism /Capture-Image /ImageFile:$imagePath /CaptureDir:${sourceVolume}:\\ /Name:"Windows Capture" /Compress:max /CheckIntegrity
  
  # Übertrage WIM zum Server
  Write-Host "Übertrage Image zum Server..."
  $destination = "\\\\$serverIP\\captures\\$captureId\\captured.wim"
  Copy-Item -Path $imagePath -Destination $destination -Force
  
  Write-Host "Capture abgeschlossen!"
  `;

    await writeFile(join(this.winPERoot, 'scripts', 'capture.ps1'), scriptContent);
  }

  async mountWinPE(wimPath: string, mountPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const mount = spawn('dism', [
        '/Mount-Wim',
        '/WimFile:' + wimPath,
        '/index:1',
        '/MountDir:' + mountPath,
      ]);

      mount.on('close', code => {
        if (code === 0) resolve();
        else reject(new Error(`Failed to mount WinPE image (Exit code: ${code})`));
      });
    });
  }

  async unmountWinPE(mountPath: string, commit: boolean = true): Promise<void> {
    const args = ['/Unmount-Wim', '/MountDir:' + mountPath];

    if (commit) {
      args.push('/Commit');
    }

    return new Promise((resolve, reject) => {
      const unmount = spawn('dism', args);

      unmount.on('close', code => {
        if (code === 0) resolve();
        else reject(new Error(`Failed to unmount WinPE image (Exit code: ${code})`));
      });
    });
  }
}
