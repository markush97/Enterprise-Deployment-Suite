# PXE Boot Setup Guide

## 1. Debian Network Install

```bash
#!/bin/bash
DEBIAN_VER="12.4.0"
ARCH="amd64"

# Create directories
mkdir -p /tftpboot/debian
cd /tftpboot/debian

# Download kernel and initrd
wget "https://deb.debian.org/debian/dists/bookworm/main/installer-${ARCH}/current/images/netboot/debian-installer/${ARCH}/linux" -O vmlinuz
wget "https://deb.debian.org/debian/dists/bookworm/main/installer-${ARCH}/current/images/netboot/debian-installer/${ARCH}/initrd.gz"

# Create preseed directory in your HTTPS server
mkdir -p /var/www/html/debian
cat > /var/www/html/debian/preseed.cfg << 'EOF'
# Basic preseed configuration
d-i debian-installer/locale string en_US
d-i keyboard-configuration/xkb-keymap select us
d-i netcfg/choose_interface select auto
d-i netcfg/get_hostname string debian
d-i netcfg/get_domain string local
d-i passwd/root-password-crypted password $1$xyz$1234567890
d-i passwd/user-fullname string Debian User
d-i passwd/username string debian
d-i passwd/user-password-crypted password $1$xyz$1234567890
d-i time/zone string UTC
d-i partman-auto/method string regular
d-i partman-auto/choose_recipe select atomic
d-i partman/confirm_write_new_label boolean true
d-i partman/choose_partition select finish
d-i partman/confirm boolean true
d-i partman/confirm_nooverwrite boolean true
EOF
```

## 2. Veeam Recovery

```javascript
const https = require('https');
const fs = require('fs');
const { execSync } = require('child_process');

async function setupVeeam() {
    // Create directories
    execSync('mkdir -p /tftpboot/veeam');
    
    // Download Veeam Recovery ISO
    // Note: You need to get the actual download URL from your Veeam license portal
    const veeamUrl = 'YOUR_VEEAM_RECOVERY_ISO_URL';
    
    // Mount ISO and extract needed files
    execSync(`
        wget ${veeamUrl} -O /tmp/veeam.iso
        mkdir -p /tmp/veeam_mount
        mount -o loop /tmp/veeam.iso /tmp/veeam_mount
        cp /tmp/veeam_mount/boot/vmlinuz /tftpboot/veeam/
        cp /tmp/veeam_mount/boot/initrd.img /tftpboot/veeam/
        umount /tmp/veeam_mount
        rm -rf /tmp/veeam_mount /tmp/veeam.iso
    `);
}
```

## 3. DiskPart Live (Using SystemRescue)

```bash
#!/bin/bash
VERSION="9.06"

# Create directories
mkdir -p /tftpboot/diskpart
cd /tftpboot/diskpart

# Download SystemRescue
wget "https://downloads.sourceforge.net/project/systemrescuecd/sysresccd-${VERSION}/systemrescue-${VERSION}-amd64.iso"

# Mount and extract needed files
mkdir -p /tmp/sysrescue
mount -o loop systemrescue-${VERSION}-amd64.iso /tmp/sysrescue
cp /tmp/sysrescue/boot/x86_64/vmlinuz .
cp /tmp/sysrescue/boot/x86_64/initrd.img .

# Create squashfs in HTTPS directory
mkdir -p /var/www/html/diskpart
cp /tmp/sysrescue/sysresccd.img /var/www/html/diskpart/filesystem.squashfs

# Cleanup
umount /tmp/sysrescue
rm -rf /tmp/sysrescue systemrescue-${VERSION}-amd64.iso
```

## 4. Clonezilla Live

```bash
#!/bin/bash
VERSION="3.1.1-22"

# Create directories
mkdir -p /tftpboot/clonezilla
cd /tftpboot/clonezilla

# Download Clonezilla
wget "https://sourceforge.net/projects/clonezilla/files/clonezilla_live_stable/${VERSION}/clonezilla-live-${VERSION}-amd64.iso"

# Mount and extract needed files
mkdir -p /tmp/clonezilla
mount -o loop clonezilla-live-${VERSION}-amd64.iso /tmp/clonezilla
cp /tmp/clonezilla/live/vmlinuz .
cp /tmp/clonezilla/live/initrd.img .

# Create squashfs in HTTPS directory
mkdir -p /var/www/html/clonezilla
cp /tmp/clonezilla/live/filesystem.squashfs /var/www/html/clonezilla/

# Cleanup
umount /tmp/clonezilla
rm -rf /tmp/clonezilla clonezilla-live-${VERSION}-amd64.iso
```

## 5. Windows 11 Setup

```javascript
const https = require('https');
const fs = require('fs');
const { execSync } = require('child_process');

async function setupWindows11() {
    // Create directories
    execSync('mkdir -p /var/www/html/win11');
    
    // Note: You need to provide your own Windows 11 ISO
    // Copy required files from mounted Windows 11 ISO
    execSync(`
        # Mount your Windows 11 ISO
        mount -o loop /path/to/win11.iso /mnt/win11
        
        # Copy boot files
        cp /mnt/win11/boot/bootmgr /var/www/html/win11/
        cp -r /mnt/win11/boot/bcd /var/www/html/win11/
        cp -r /mnt/win11/boot/boot.sdi /var/www/html/win11/
        cp -r /mnt/win11/sources/boot.wim /var/www/html/win11/
        
        # Unmount
        umount /mnt/win11
    `);
}
```

## 6. Windows 10 Setup

```javascript
const https = require('https');
const fs = require('fs');
const { execSync } = require('child_process');

async function setupWindows10() {
    // Create directories
    execSync('mkdir -p /var/www/html/win10');
    
    // Note: You need to provide your own Windows 10 ISO
    // Copy required files from mounted Windows 10 ISO
    execSync(`
        # Mount your Windows 10 ISO
        mount -o loop /path/to/win10.iso /mnt/win10
        
        # Copy boot files
        cp /mnt/win10/boot/bootmgr /var/www/html/win10/
        cp -r /mnt/win10/boot/bcd /var/www/html/win10/
        cp -r /mnt/win10/boot/boot.sdi /var/www/html/win10/
        cp -r /mnt/win10/sources/boot.wim /var/www/html/win10/
        
        # Unmount
        umount /mnt/win10
    `);
}
```

## Server Setup Requirements

1. TFTP Server Setup:
```bash
# Install TFTP server (Ubuntu/Debian)
apt-get install tftpd-hpa

# Configure TFTP
cat > /etc/default/tftpd-hpa << EOF
TFTP_USERNAME="tftp"
TFTP_DIRECTORY="/tftpboot"
TFTP_ADDRESS="0.0.0.0:69"
TFTP_OPTIONS="--secure"
EOF

# Restart TFTP service
systemctl restart tftpd-hpa
```

2. HTTPS Server Setup:
```bash
# Install nginx
apt-get install nginx

# Configure nginx
cat > /etc/nginx/sites-available/pxe << EOF
server {
    listen 443 ssl;
    server_name your-server;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    root /var/www/html;
    
    location / {
        autoindex on;
        client_max_body_size 0;
    }
}
EOF

ln -s /etc/nginx/sites-available/pxe /etc/nginx/sites-enabled/
systemctl restart nginx
```

3. File Permissions:
```bash
# Set correct permissions
chmod -R 755 /tftpboot
chmod -R 755 /var/www/html
chown -R tftp:tftp /tftpboot
chown -R www-data:www-data /var/www/html
```

Remember to:
1. Replace `your-server` with your actual server hostname
2. Generate proper SSL certificates for HTTPS
3. Adjust firewall rules to allow TFTP (UDP 69) and HTTPS (TCP 443)
4. Ensure enough disk space for all boot images
5. Regular updates of boot images for security patches