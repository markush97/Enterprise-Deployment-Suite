import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { DeviceEntity } from './entities/device.entity';
import { CreateDeviceDto } from './dto/create-device.dto';
import { CustomersService } from '../customers/customers.service';
import { DeviceInformationDto } from './dto/update-device-info.dto';
import { MTIHttpException } from 'src/core/errorhandling/exceptions/mit-exception';
import { ForbiddenMTIException } from 'src/core/errorhandling/exceptions/forbidden.mti-exception';
import { MTIErrorCodes } from 'src/core/errorhandling/exceptions/mti.error-codes.enum';


@Injectable()
export class DevicesService {
  private readonly logger = new Logger(DevicesService.name);

  constructor(
    @InjectRepository(DeviceEntity)
    private readonly deviceRepository: EntityRepository<DeviceEntity>,
    private readonly customersService: CustomersService,
    private readonly em: EntityManager
  ) { }

  async findAll(): Promise<DeviceEntity[]> {
    return this.deviceRepository.findAll({ populate: ['customer'] });
  }

  async findOne(id: string): Promise<DeviceEntity> {
    const device = await this.deviceRepository.findOne(id, { populate: ['customer'] });
    if (!device) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }
    return device;
  }

  async findOneWithSecret(id: string): Promise<DeviceEntity> {
    const device = await this.deviceRepository.findOne(id, { fields: ['*'] });
    if (!device) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }
    return device;
  }

  async create(createDeviceDto: CreateDeviceDto): Promise<DeviceEntity> {
    const customer = await this.customersService.findOne(createDeviceDto.customerId);
    const device = this.deviceRepository.create({
      ...createDeviceDto,
      customer,
    });
    await this.em.persistAndFlush(device);
    return device;
  }

  async update(id: string, updateDeviceDto: Partial<CreateDeviceDto>): Promise<DeviceEntity> {
    const device = await this.findOne(id);
    if (updateDeviceDto.customerId) {
      const customer = await this.customersService.findOne(updateDeviceDto.customerId);
      device.customer = customer;
    }
    this.deviceRepository.assign(device, updateDeviceDto);
    await this.em.flush();
    return device;
  }

  async remove(id: string): Promise<void> {
    const device = await this.findOne(id);
    await this.em.removeAndFlush(device);
  }

  async updateDeviceInfo(deviceToken: string, updateDeviceDto: Partial<DeviceInformationDto>): Promise<void> {
    this.logger.debug('updateDeviceInfo');

    const device = await this.deviceRepository.findOne({ deviceSecret: deviceToken });

    if (!device) {
      this.logger.error('Device not found');
      throw new ForbiddenMTIException(MTIErrorCodes.DEVICE_TOKEN_INVALID, `Token is invalid or device not found`);

    }
    this.deviceRepository.assign(device, updateDeviceDto);
    await this.em.flush();
    this.logger.debug('Device information updated successfully');
  }
}
