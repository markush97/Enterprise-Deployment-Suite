import { DeviceType } from 'src/devices/entities/device.entity';

import { Injectable, NotFoundException } from '@nestjs/common';

import { EntityManager } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/sqlite';

import { CreateCustomerDto } from './dto/create-customer.dto';
import { SetDeviceCountersAndOUsDto } from './dto/set-device-counters-ou.dto';
import { CustomerEntity } from './entities/customer.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly customerRepository: EntityRepository<CustomerEntity>,
    private readonly em: EntityManager,
  ) {}

  async findAll(): Promise<CustomerEntity[]> {
    return this.customerRepository.findAll();
  }

  async findOne(id: string): Promise<CustomerEntity> {
    const customer = await this.customerRepository.findOne(id);
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return customer;
  }

  async create(createCustomerDto: CreateCustomerDto): Promise<CustomerEntity> {
    const customer = this.customerRepository.create(createCustomerDto);
    await this.em.persistAndFlush(customer);
    return customer;
  }

  async update(id: string, updateCustomerDto: Partial<CreateCustomerDto>): Promise<CustomerEntity> {
    const customer = await this.findOne(id);
    this.customerRepository.assign(customer, updateCustomerDto);
    await this.em.flush();
    return customer;
  }

  async remove(id: string): Promise<void> {
    const customer = await this.findOne(id);
    await this.em.removeAndFlush(customer);
  }

  /**
   * Increase the device number for a specific customer and device type And return the next device number.
   */
  async increaseDeviceNumber(customerId: string, deviceType: DeviceType): Promise<number> {
    const customer = await this.customerRepository.findOneOrFail(customerId);
    let nextDeviceNumber: number;

    switch (deviceType) {
      case DeviceType.TABLET:
        nextDeviceNumber = customer.deviceCounterTab += 1;
        break;
      case DeviceType.PC:
        nextDeviceNumber = customer.deviceCounterPc += 1;
        break;
      case DeviceType.NOTEBOOK:
        nextDeviceNumber = customer.deviceCounterNb += 1;
        break;
      case DeviceType.MAC:
        nextDeviceNumber = customer.deviceCounterMac += 1;
        break;
      case DeviceType.SERVER:
        nextDeviceNumber = customer.deviceCounterSrv += 1;
        break;
      case DeviceType.OTHER:
        nextDeviceNumber = customer.deviceCounterDiv += 1;
        break;
      default:
        throw new Error(`Unknown device type: ${deviceType}`);
    }

    await this.em.persistAndFlush(customer);
    return nextDeviceNumber;
  }

  async setDeviceCountersAndOUs(
    id: string,
    data: SetDeviceCountersAndOUsDto
  ): Promise<CustomerEntity> {
    const customer = await this.customerRepository.findOneOrFail(id);
    Object.assign(customer, data);
    await this.em.flush();
    return customer;
  }
}
