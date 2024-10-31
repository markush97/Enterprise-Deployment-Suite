import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/sqlite';
import { Device } from './entities/device.entity';
import { CreateDeviceDto } from './dto/create-device.dto';
import { CustomersService } from '../customers/customers.service';

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(Device)
    private readonly deviceRepository: EntityRepository<Device>,
    private readonly customersService: CustomersService,
  ) {}

  async findAll(): Promise<Device[]> {
    return this.deviceRepository.findAll({ populate: ['customer'] });
  }

  async findOne(id: string): Promise<Device> {
    const device = await this.deviceRepository.findOne(id, { populate: ['customer'] });
    if (!device) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }
    return device;
  }

  async create(createDeviceDto: CreateDeviceDto): Promise<Device> {
    const customer = await this.customersService.findOne(createDeviceDto.customerId);
    const device = this.deviceRepository.create({
      ...createDeviceDto,
      customer,
    });
    await this.deviceRepository.persistAndFlush(device);
    return device;
  }

  async update(id: string, updateDeviceDto: Partial<CreateDeviceDto>): Promise<Device> {
    const device = await this.findOne(id);
    if (updateDeviceDto.customerId) {
      const customer = await this.customersService.findOne(updateDeviceDto.customerId);
      device.customer = customer;
    }
    this.deviceRepository.assign(device, updateDeviceDto);
    await this.deviceRepository.flush();
    return device;
  }

  async remove(id: string): Promise<void> {
    const device = await this.findOne(id);
    await this.deviceRepository.removeAndFlush(device);
  }
}