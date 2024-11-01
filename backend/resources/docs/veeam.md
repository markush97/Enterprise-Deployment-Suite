## Veeam Bare Metal Recovery Setup

### Voraussetzungen

1. Veeam Backup & Replication Server
2. Zugriff auf Veeam Recovery Media Builder
3. Netzwerkverbindung zwischen PXE-Server und Veeam-Server

### Recovery Media vorbereiten

1. Auf dem Veeam Backup & Replication Server:
   ```bash
   # Recovery Media Builder öffnen
   # ISO erstellen mit folgenden Optionen:
   - Linux-based media
   - Include network drivers
   - Enable automation
   ```

2. ISO extrahieren:
   ```bash
   # ISO mounten und Dateien kopieren:
   mkdir veeam-media
   mount -o loop veeam-recovery.iso veeam-media/
   cp veeam-media/kernel.efi tftp-root/veeam/
   cp veeam-media/initrd.img tftp-root/veeam/
   ```

### API Verwendung

1. Veeam-Restore konfigurieren:
   ```bash
   curl -X POST http://localhost:3000/veeam/setup \
     -H "Content-Type: application/json" \
     -d '{
       "serverIp": "192.168.1.100",
       "port": 10005,
       "username": "backup_user",
       "password": "secure_password",
       "backupId": "backup-001",
       "restorePointId": "latest"
     }'
   ```

2. Client via PXE booten:
   - BIOS/UEFI auf Netzwerk-Boot stellen
   - System startet automatisch die Veeam Recovery Environment
   - Restore-Prozess läuft automatisch mit den konfigurierten Parametern

### Troubleshooting

1. Netzwerk-Probleme:
   ```bash
   # Auf dem Client prüfen:
   ip addr
   ping [veeam-server-ip]
   ```

2. Veeam-Verbindung testen:
   ```bash
   # In der Recovery-Umgebung:
   veeamconfig test --server [ip] --port [port]
   ```

3. Logs prüfen:
   ```bash
   # In der Recovery-Umgebung:
   cat /var/log/veeam/recovery.log
   ```