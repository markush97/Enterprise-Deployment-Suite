import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/sqlite';
import { VpnProfile } from './entities/vpn-profile.entity';
import { CreateVpnProfileDto } from './dto/create-vpn-profile.dto';
import { CustomersService } from '../customers/customers.service';

@Injectable()
export class VpnService {
  constructor(
    @InjectRepository(VpnProfile)
    private readonly vpnRepository: EntityRepository<VpnProfile>,
    private readonly customersService: CustomersService,
  ) {}

  async findAll(): Promise<VpnProfile[]> {
    return this.vpnRepository.findAll({ populate: ['customer'] });
  }

  async findOne(id: string): Promise<VpnProfile> {
    const profile = await this.vpnRepository.findOne(id, { populate: ['customer'] });
    if (!profile) {
      throw new NotFoundException(`VPN profile with ID ${id} not found`);
    }
    return profile;
  }

  async findByCustomer(customerId: string): Promise<VpnProfile[]> {
    const customer = await this.customersService.findOne(customerId);
    return this.vpnRepository.find({ customer }, { populate: ['customer'] });
  }

  async create(createVpnProfileDto: CreateVpnProfileDto): Promise<VpnProfile> {
    const customer = await this.customersService.findOne(createVpnProfileDto.customerId);
    
    if (createVpnProfileDto.isDefault) {
      // Remove default flag from other profiles for this customer
      const existingProfiles = await this.findByCustomer(customer.id);
      for (const profile of existingProfiles) {
        if (profile.isDefault) {
          profile.isDefault = false;
          await this.vpnRepository.flush();
        }
      }
    }

    const profile = this.vpnRepository.create({
      ...createVpnProfileDto,
      customer,
    });

    await this.vpnRepository.persistAndFlush(profile);
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
          await this.vpnRepository.flush();
        }
      }
    }

    this.vpnRepository.assign(profile, updateVpnProfileDto);
    await this.vpnRepository.flush();
    return profile;
  }

  async remove(id: string): Promise<void> {
    const profile = await this.findOne(id);
    
    // Don't allow deletion of default profiles
    if (profile.isDefault) {
      throw new Error('Cannot delete the default VPN profile');
    }

    await this.vpnRepository.removeAndFlush(profile);
  }

  async testConnection(id: string): Promise<{ success: boolean; message: string }> {
    const profile = await this.findOne(id);
    
    // Simulate VPN test
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock success/failure (80% success rate)
    const success = Math.random() > 0.2;
    
    return {
      success,
      message: success ? 'Connection test successful' : 'Connection test failed',
    };
  }
}