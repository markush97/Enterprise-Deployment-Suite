# PXE Boot Setup Guide

## Verzeichnisstruktur für Windows Deployment

```
tftp-root/
├── Boot/
│   ├── BCD                 # Windows Boot Configuration Data
│   ├── boot.sdi           # Windows System Deployment Image
│   └── bootx64.efi        # Windows Boot Manager
├── pxe/
│   ├── bootx64.efi        # GRUB EFI bootloader
│   └── grub/
│       ├── grub.cfg       # Haupt-GRUB-Konfiguration
│       └── windows11.cfg  # Windows-spezifische GRUB-Konfiguration
└── images/
    └── windows11/
        ├── sources/
        │   ├── boot.wim   # Windows PE Boot Image
        │   └── install.wim # Windows Installation Image
        └── Windows/       # Windows Installationsdateien
```

## Setup-Anleitung

1. Windows ISO vorbereiten:
   ```bash
   # Erstelle Verzeichnisse
   mkdir -p tftp-root/images/windows11
   
   # Mounten der Windows ISO
   sudo mount -o loop windows11.iso /mnt
   
   # Kopieren der Installationsdateien
   cp -r /mnt/* tftp-root/images/windows11/
   ```

2. Boot-Dateien kopieren:
   ```bash
   # Kopiere Windows Boot-Dateien
   cp tftp-root/images/windows11/Boot/BCD tftp-root/Boot/
   cp tftp-root/images/windows11/Boot/boot.sdi tftp-root/Boot/
   cp tftp-root/images/windows11/efi/boot/bootx64.efi tftp-root/Boot/
   ```

3. DHCP-Server konfigurieren (beispiel für ISC DHCP):
   ```conf
   subnet 192.168.1.0 netmask 255.255.255.0 {
     range 192.168.1.100 192.168.1.200;
     option routers 192.168.1.1;
     option domain-name-servers 8.8.8.8;
     
     # PXE-Boot Konfiguration
     filename "pxe/bootx64.efi";
     next-server 192.168.1.10; # IP des PXE-Servers
   }
   ```

4. NestJS Server starten:
   ```bash
   npm run build
   npm run start
   ```

## Windows-Image aktivieren

```bash
# Image aktivieren
curl -X POST http://localhost:3000/pxe/activate/windows11

# Status prüfen
curl http://localhost:3000/pxe/active
```

## Troubleshooting

1. TFTP-Fehler überprüfen:
   ```bash
   tail -f /var/log/syslog | grep tftp
   ```

2. Netzwerk-Boot-Reihenfolge im Client-BIOS:
   - Aktiviere UEFI Network Boot
   - Setze Network Boot an erste Stelle

3. Häufige Probleme:
   - DHCP-Server erreicht Client nicht: Netzwerk-Konfiguration prüfen
   - TFTP Timeout: Firewall-Regeln für Port 69 prüfen
   - Boot-Fehler: BCD und boot.sdi Dateien überprüfen