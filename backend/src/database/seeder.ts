import { MikroORM } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Customer } from '../customers/entities/customer.entity';
import { Device } from '../devices/entities/device.entity';
import { Image } from '../images/entities/image.entity';
import { Job } from '../jobs/entities/job.entity';
import { VpnProfile } from '../vpn/entities/vpn-profile.entity';
import { User } from '../users/entities/user.entity';

export class DatabaseSeeder extends Seeder {
  async run(orm: MikroORM): Promise<void> {
    const em = orm.em.fork();

    // Create customers
    const customer1 = em.create(Customer, {
      name: 'Example Corp GmbH',
      shortCode: 'EXC',
      pulsewayId: 'PW123456',
      settings: {
        defaultClientImage: 'Windows 11 Enterprise 22H2',
        defaultServerImage: 'Windows Server 2022',
      },
    });

    const customer2 = em.create(Customer, {
      name: 'Tech Solutions AG',
      shortCode: 'TSA',
      pulsewayId: 'PW789012',
      settings: {
        defaultClientImage: 'Windows 11 Enterprise 22H2',
        defaultServerImage: 'Windows Server 2022',
      },
    });

    await em.persistAndFlush([customer1, customer2]);

    // Create VPN profiles
    const vpn1 = em.create(VpnProfile, {
      customer: customer1,
      name: 'Main Office VPN',
      type: 'cisco-anyconnect',
      hostname: 'vpn.example.com',
      port: 443,
      username: 'vpnuser',
      password: 'encrypted-password',
      protocol: 'tcp',
      testIp: '192.168.1.1',
      isDefault: true,
    });

    const vpn2 = em.create(VpnProfile, {
      customer: customer1,
      name: 'WireGuard VPN',
      type: 'wireguard',
      hostname: 'wg.example.com',
      port: 51820,
      protocol: 'udp',
      testIp: '10.0.0.1',
      wireGuardConfig: {
        privateKey: 'private-key',
        publicKey: 'public-key',
        endpoint: 'wg.example.com:51820',
        allowedIPs: ['0.0.0.0/0'],
        persistentKeepalive: 25,
      },
    });

    await em.persistAndFlush([vpn1, vpn2]);

    // Create images
    const image1 = em.create(Image, {
      name: 'Windows 11 Enterprise',
      version: '22H2',
      distribution: 'Windows 11',
      buildNumber: '22621.1702',
      imagePath: '/images/win11-22h2.wim',
      size: 4.7 * 1024 * 1024 * 1024, // 4.7GB
    });

    const image2 = em.create(Image, {
      name: 'Ubuntu Server LTS',
      version: '22.04',
      distribution: 'Ubuntu 22.04',
      buildNumber: '22.04.3',
      imagePath: '/images/ubuntu-22.04.3.iso',
      size: 1.2 * 1024 * 1024 * 1024, // 1.2GB
    });

    await em.persistAndFlush([image1, image2]);

    // Create devices
    const device1 = em.create(Device, {
      name: 'EXC-CLIENT-001',
      type: 'client',
      customer: customer1,
      createdBy: 'admin@cwi.at',
      macAddress: '00:1A:2B:3C:4D:5E',
      bitlockerKey: 'XYZ-123-ABC-456',
      osVersion: 'Windows 11',
      imageName: 'Windows 11 Enterprise 22H2',
    });

    const device2 = em.create(Device, {
      name: 'EXC-SERVER-001',
      type: 'server',
      customer: customer1,
      createdBy: 'admin@cwi.at',
      macAddress: '00:1A:2B:3C:4D:5F',
      bitlockerKey: 'DEF-789-GHI-012',
      osVersion: 'Windows Server 2022',
      imageName: 'Windows Server 2022',
    });

    await em.persistAndFlush([device1, device2]);

    // Create jobs
    const job1 = em.create(Job, {
      device: device1,
      customer: customer1,
      image: image1,
      status: 'preparing',
    });

    const job2 = em.create(Job, {
      device: device2,
      customer: customer1,
      image: image2,
      status: 'done',
      completedAt: new Date(),
    });

    await em.persistAndFlush([job1, job2]);

    // Create users
    const user1 = em.create(User, {
      email: 'admin@cwi.at',
      name: 'Admin User',
      role: 'administrator',
      isEntraId: false,
    });

    const user2 = em.create(User, {
      email: 'engineer@cwi.at',
      name: 'System Engineer',
      role: 'systemengineer',
      isEntraId: true,
    });

    await em.persistAndFlush([user1, user2]);
  }
}