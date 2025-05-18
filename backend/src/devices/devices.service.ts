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
import { ITGlueService } from 'src/integrations/itglue/itglue.service';
import { ITGlueType } from 'src/integrations/itglue/interfaces/itglue-type.enum';
import { ITGlueConfigurationType } from 'src/integrations/itglue/interfaces/configuration-type.enum';
import { NotFoundMTIException } from 'src/core/errorhandling/exceptions/not-found.mti-exception';
import { pick } from 'lodash';

@Injectable()
export class DevicesService {
  private readonly logger = new Logger(DevicesService.name);

  constructor(
    @InjectRepository(DeviceEntity)
    private readonly deviceRepository: EntityRepository<DeviceEntity>,
    private readonly customersService: CustomersService,
    private readonly em: EntityManager,
    private readonly itGlue: ITGlueService
  ) { }

  async findAll(): Promise<DeviceEntity[]> {
    return this.deviceRepository.findAll({ populate: ['customer'] });
  }

  async findOne(id: string): Promise<DeviceEntity | null> {
    const device = await this.deviceRepository.findOne(id, { populate: ['customer'] });
    return device;
  }

  async findOneBySerial(serial: string): Promise<DeviceEntity | null> {
    const device = await this.deviceRepository.findOne({ serialNumber: serial });
    return device;
  }

  async findOneOrFail(id: string): Promise<DeviceEntity> {
    const device = await this.deviceRepository.findOne(id, { populate: ['customer'] });
    if (!device) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }
    return device;
  }

  async findOneByToken(deviceToken: string): Promise<DeviceEntity | null> {
    const device = await this.deviceRepository.findOne({ deviceSecret: deviceToken }, { populate: ['customer'] });
    return device;
  }

  async findOneByTokenOrFail(deviceToken: string): Promise<DeviceEntity> {
    const device = await this.deviceRepository.findOne({ deviceSecret: deviceToken }, { populate: ['customer'] });
    if (!device) {
      throw new NotFoundMTIException(MTIErrorCodes.DEVICE_TOKEN_INVALID, `Token is invalid or device not found`);
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

  async updateDeviceInfo(deviceToken: string, updateDeviceDto: DeviceInformationDto): Promise<void> {
    this.logger.debug('updateDeviceInfo');

    const device = await this.findOneByToken(deviceToken);

    if (!device) {
      this.logger.error('Device not found');
      throw new ForbiddenMTIException(MTIErrorCodes.DEVICE_TOKEN_INVALID, `Token is invalid or device not found`);

    }

    const serialNumber = updateDeviceDto.serialNumber || device.serialNumber;
    device.serialNumber = serialNumber;
    updateDeviceDto.serialNumber = serialNumber;
    const itGlueDevice = await this.itGlue.getDeviceBySerial(serialNumber);

    if (!itGlueDevice) {
      this.logger.debug('Device not found in ITGlue, creating new device');
      await this.itGlue.createDevice(updateDeviceDto, device.customer.itGlueId, device.id);
    } else {
      this.logger.debug('Device found in ITGlue, updating device');
      await this.itGlue.updateDevice(itGlueDevice, updateDeviceDto, device.id);
    }

    device.assign(pick(updateDeviceDto, DeviceEntity));

    await this.em.flush();
    this.logger.debug('Device information updated successfully');

  }
}
