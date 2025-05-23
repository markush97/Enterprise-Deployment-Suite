import { randomUUID } from 'crypto';
import { Logger } from 'nestjs-pino';
import { promise as ping } from 'ping';
import { BadRequestMTIException } from 'src/core/errorhandling/exceptions/bad-request.mti-exception';
import { MTIErrorCodes } from 'src/core/errorhandling/exceptions/mti.error-codes.enum';
import { NotFoundMTIException } from 'src/core/errorhandling/exceptions/not-found.mti-exception';

import { Injectable, NotFoundException, OnModuleDestroy } from '@nestjs/common';

import { EntityManager } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/sqlite';

import { CustomersService } from '../customers/customers.service';
import { CreateVpnProfileDto } from './dto/create-vpn-profile.dto';
import { VpnProfile } from './entities/vpn-profile.entity';
import { VPNConnection } from './vpn.connection.interface';

@Injectable()
export class VpnService implements OnModuleDestroy {
  protected readonly logger: Logger;
  protected readonly vpnConnections: VPNConnection[] = [];

  constructor(
    @InjectRepository(VpnProfile)
    private readonly vpnRepository: EntityRepository<VpnProfile>,
    private readonly customersService: CustomersService,
    private readonly em: EntityManager,
  ) {}

  async findAll(): Promise<VpnProfile[]> {
    return this.vpnRepository.findAll();
  }

  async findOne(id: string): Promise<VpnProfile> {
    const profile = await this.vpnRepository.findOne(id);
    if (!profile) {
      throw new NotFoundMTIException(
        MTIErrorCodes.ENTITY_NOT_FOUND,
        `VPN profile with ID ${id} not found`,
      );
    }
    return profile;
  }

  async disconnectTunnel(connection: VPNConnection): Promise<void> {}

  async connectTunnel(id: string): Promise<VPNConnection> {
    const profile = await this.findOne(id);

    return {
      profile,
      id: randomUUID(),
      creationTime: new Date(),
      up: false,
      down: () => {},
    };
  }

  async findByCustomer(customerId: string): Promise<VpnProfile[]> {
    const customer = await this.customersService.findOne(customerId);
    return this.vpnRepository.find({ customer });
  }

  async create(createVpnProfileDto: CreateVpnProfileDto): Promise<VpnProfile> {
    const customer = await this.customersService.findOne(createVpnProfileDto.customerId);

    if (createVpnProfileDto.isDefault) {
      // Remove default flag from other profiles for this customer
      const existingProfiles = await this.findByCustomer(customer.id);
      for (const profile of existingProfiles) {
        if (profile.isDefault) {
          profile.isDefault = false;
          await this.em.flush();
        }
      }
    }

    const profile = this.vpnRepository.create({
      ...createVpnProfileDto,
      customer,
    });

    await this.em.persistAndFlush(profile);
    return profile;
  }

  async update(id: string, updateVpnProfileDto: Partial<CreateVpnProfileDto>): Promise<VpnProfile> {
    const profile = await this.findOne(id);

    if (updateVpnProfileDto.customerId) {
      const customer = await this.customersService.findOne(updateVpnProfileDto.customerId);
      profile.customer = customer;
    }

    if (updateVpnProfileDto.isDefault) {
      // Remove default flag from other profiles for this customer
      const existingProfiles = await this.findByCustomer(profile.customer.id);
      for (const p of existingProfiles) {
        if (p.id !== id && p.isDefault) {
          p.isDefault = false;
          await this.em.flush();
        }
      }
    }

    this.vpnRepository.assign(profile, updateVpnProfileDto);
    await this.em.flush();
    return profile;
  }

  async remove(id: string): Promise<void> {
    const profile = await this.findOne(id);

    // Don't allow deletion of default profiles
    if (profile.isDefault) {
      throw new BadRequestMTIException(
        MTIErrorCodes.REMOVING_DEFAULT_VPN,
        'Cannot delete the default VPN profile',
      );
    }

    await this.em.removeAndFlush(profile);
  }

  async testConnection(id: string): Promise<{ success: boolean; message: string }> {
    const connection = await this.connectTunnel(id);

    const success = await this.pingTest(connection);
    return {
      success,
      message: success ? 'Connection test successful' : 'Connection test failed',
    };
  }

  async pingTest(vpnConnection: VPNConnection, retries = 3, delay = 2): Promise<boolean> {
    this.logger.debug(`Pinging tunnel by using host ${vpnConnection.profile.testIp}...`);
    const res = await ping.probe(vpnConnection.profile.testIp);

    for (let retry = 0; retry < retries; retry++) {
      if (res.alive) {
        this.logger.debug(`Ping suceeded with ${res.avg}ms average`);
        return true;
      } else {
        this.logger.warn(`Ping not successfull! Retrying ${retries - retry} more times...`);
      }

      // delay by resolving promise only after timeout
      await new Promise<boolean>(resolve => setTimeout(resolve, delay));
    }
    return false;
  }

  async onModuleDestroy() {
    // Close all Tunnels on Application Shutdown
    await Promise.all(this.vpnConnections.map(async config => await this.disconnectTunnel(config)));
  }
}
