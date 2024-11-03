#!/bin/bash
# Setup script for Password Reset Tool

# Create directories
mkdir -p /tftpboot/passreset
mkdir -p /var/www/html/passreset/overlay
cd /tftpboot/passreset

# Create custom Ubuntu-based live system
wget https://releases.ubuntu.com/22.04/ubuntu-22.04.3-live-server-amd64.iso -O ubuntu.iso

# Mount the ISO
mkdir -p /tmp/ubuntu_mount
mount -o loop ubuntu.iso /tmp/ubuntu_mount

# Extract the kernel and initrd
cp /tmp/ubuntu_mount/casper/vmlinuz .
cp /tmp/ubuntu_mount/casper/initrd .

# Create custom overlay
mkdir -p /tmp/overlay
cd /tmp/overlay

# Create password reset web interface
cat > /var/www/html/passreset/overlay/usr/local/bin/password-reset-ui << 'EOF'
#!/usr/bin/env python3
import tkinter as tk
from tkinter import ttk
import subprocess
import os
import re

class PasswordResetUI:
    def __init__(self, root):
        self.root = root
        root.title("Windows Password Reset Tool")
        
        # Style
        style = ttk.Style()
        style.theme_use('clam')
        
        # Main frame
        main_frame = ttk.Frame(root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Disk selection
        ttk.Label(main_frame, text="Select Windows Drive:").grid(row=0, column=0, pady=5)
        self.disk_var = tk.StringVar()
        self.disk_combo = ttk.Combobox(main_frame, textvariable=self.disk_var)
        self.disk_combo.grid(row=0, column=1, pady=5)
        self.refresh_disks()
        
        # User selection
        ttk.Label(main_frame, text="Select User:").grid(row=1, column=0, pady=5)
        self.user_var = tk.StringVar()
        self.user_combo = ttk.Combobox(main_frame, textvariable=self.user_var)
        self.user_combo.grid(row=1, column=1, pady=5)
        
        # New password
        ttk.Label(main_frame, text="New Password:").grid(row=2, column=0, pady=5)
        self.password_var = tk.StringVar()
        self.password_entry = ttk.Entry(main_frame, textvariable=self.password_var, show="*")
        self.password_entry.grid(row=2, column=1, pady=5)
        
        # Reset button
        self.reset_btn = ttk.Button(main_frame, text="Reset Password", command=self.reset_password)
        self.reset_btn.grid(row=3, column=0, columnspan=2, pady=10)
        
        # Status label
        self.status_var = tk.StringVar()
        ttk.Label(main_frame, textvariable=self.status_var).grid(row=4, column=0, columnspan=2)
        
        # Bind events
        self.disk_combo.bind('<<ComboboxSelected>>', self.refresh_users)
    
    def refresh_disks(self):
        disks = subprocess.check_output(['lsblk', '-no', 'NAME,SIZE']).decode().split('\n')
        self.disks = [d.split()[0] for d in disks if d and not d.startswith('loop')]
        self.disk_combo['values'] = self.disks
    
    def refresh_users(self, event=None):
        if not self.disk_var.get():
            return
            
        # Mount selected drive
        mount_point = f"/mnt/{self.disk_var.get()}"
        os.makedirs(mount_point, exist_ok=True)
        subprocess.run(['mount', f"/dev/{self.disk_var.get()}", mount_point])
        
        # Get users from Windows registry
        users = []
        try:
            reg_output = subprocess.check_output(['chntpw', '-l', f"{mount_point}/Windows/System32/config/SAM"]).decode()
            users = re.findall(r'RID:\s+\d+\s+\[(.*?)\]', reg_output)
        finally:
            subprocess.run(['umount', mount_point])
        
        self.user_combo['values'] = users
    
    def reset_password(self):
        if not all([self.disk_var.get(), self.user_var.get(), self.password_var.get()]):
            self.status_var.set("Please fill all fields")
            return
            
        try:
            # Mount drive
            mount_point = f"/mnt/{self.disk_var.get()}"
            os.makedirs(mount_point, exist_ok=True)
            subprocess.run(['mount', f"/dev/{self.disk_var.get()}", mount_point])
            
            # Reset password using chntpw
            proc = subprocess.Popen(['chntpw', '-u', self.user_var.get(), 
                                   f"{mount_point}/Windows/System32/config/SAM"],
                                  stdin=subprocess.PIPE)
            proc.communicate(input=b"2\ny\nq\n")  # Select reset password option
            
            self.status_var.set("Password reset successful!")
        except Exception as e:
            self.status_var.set(f"Error: {str(e)}")
        finally:
            subprocess.run(['umount', mount_point])

if __name__ == "__main__":
    root = tk.Tk()
    app = PasswordResetUI(root)
    root.mainloop()
EOF

# Make the UI script executable
chmod +x /var/www/html/passreset/overlay/usr/local/bin/password-reset-ui

# Create systemd service for auto-starting the UI
cat > /var/www/html/passreset/overlay/etc/systemd/system/password-reset-ui.service << 'EOF'
[Unit]
Description=Password Reset UI
After=multi-user.target

[Service]
Type=simple
ExecStart=/usr/local/bin/password-reset-ui
Restart=always
User=root
Environment=DISPLAY=:0

[Install]
WantedBy=multi-user.target
EOF

# Create custom initrd with required packages
cat > /tmp/overlay/custom.conf << EOF
#!/bin/sh
# Install required packages
apt-get update
apt-get install -y python3-tk chntpw xorg openbox

# Enable password reset service
systemctl enable password-reset-ui

# Start X automatically
if [ -z "\${DISPLAY}" ] && [ "\${XDG_VTNR}" -eq 1 ]; then
  startx
fi
EOF

# Create the squashfs
mksquashfs /tmp/overlay /var/www/html/passreset/filesystem.squashfs

# Sign the kernel and initrd for Secure Boot
sbsign --key /path/to/your/signing.key --cert /path/to/your/signing.crt --output vmlinuz.signed vmlinuz
sbsign --key /path/to/your/signing.key --cert /path/to/your/signing.crt --output initrd.signed initrd

# Cleanup
umount /tmp/ubuntu_mount
rm -rf /tmp/ubuntu_mount /tmp/overlay ubuntu.iso