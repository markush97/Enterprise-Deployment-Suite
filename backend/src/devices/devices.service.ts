import { pick } from 'lodash';
import { BadRequestMTIException } from 'src/core/errorhandling/exceptions/bad-request.mti-exception';
import { MTIErrorCodes } from 'src/core/errorhandling/exceptions/mti.error-codes.enum';
import { NotFoundMTIException } from 'src/core/errorhandling/exceptions/not-found.mti-exception';
import { ITGlueConfigurationType } from 'src/integrations/itglue/interfaces/configuration-type.enum';
import { ITGlueOperatingSystem } from 'src/integrations/itglue/interfaces/itglue.operatingsystems.enum';
import { ITGlueService } from 'src/integrations/itglue/itglue.service';

import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';

import { CustomersService } from '../customers/customers.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { DeviceInformationDto } from './dto/update-device-info.dto';
import { DeviceEntity } from './entities/device.entity';
import { CustomerEntity } from 'src/customers/entities/customer.entity';
import { generateSecureRandomAlphanumericString, generateSecureRandomString } from 'src/core/utils/crypto.helper';

@Injectable()
export class DevicesService {
  private readonly logger = new Logger(DevicesService.name);

  constructor(
    @InjectRepository(DeviceEntity)
    private readonly deviceRepository: EntityRepository<DeviceEntity>,
    private readonly customersService: CustomersService,
    private readonly em: EntityManager,
    private readonly itGlue: ITGlueService,
  ) {}

  async findAll(): Promise<DeviceEntity[]> {
    return this.deviceRepository.findAll({ populate: ['customer'] });
  }

  async findOneWithPassword(id: string): Promise<Pick<DeviceEntity, 'localPassword' | 'id' | 'name' | 'serialNumber' | 'deviceSecret' | 'assign' | 'getSchema' | 'init' | 'serialize'> | null> {
    const device = await this.deviceRepository.findOne(id, {
      fields: ['localPassword', 'id', 'name', 'serialNumber', 'deviceSecret'],
    });
    return device;
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
    const device = await this.deviceRepository.findOne(
      { deviceSecret: deviceToken },
      { populate: ['customer'] },
    );
    return device;
  }

  async findOneByTokenOrFail(deviceToken: string): Promise<DeviceEntity> {
    const device = await this.deviceRepository.findOne(
      { deviceSecret: deviceToken },
      { populate: ['customer'] },
    );
    if (!device) {
      throw new NotFoundMTIException(
        MTIErrorCodes.DEVICE_TOKEN_INVALID,
        `Token is invalid or device not found`,
      );
    }

    return device;
  }

  async create(createDeviceDto: CreateDeviceDto): Promise<DeviceEntity> {
    let customer: CustomerEntity;
    if (createDeviceDto.customerId) {
      customer = await this.customersService.findOne(createDeviceDto.customerId);
    }
    
    const device = this.deviceRepository.create({
      ...createDeviceDto,
      customer,
    });
    await this.em.persistAndFlush(device);
    return device;
  }

  async update(id: string, updateDeviceDto: Partial<CreateDeviceDto> & {autogeneratePassword?: boolean, password?: string}): Promise<DeviceEntity> {
    const device = await this.findOne(id);
    if (updateDeviceDto.customerId) {
      const customer = await this.customersService.findOne(updateDeviceDto.customerId);
      device.customer = customer;
    }
    
    this.deviceRepository.assign(device, updateDeviceDto);

    if (updateDeviceDto.autogeneratePassword) {
      this.logger.debug('Autogenerating password for device');
      // Generate a 10-char alphanumeric password (no special chars) and encode it in base64
      // This is of course not secure.
      const password = generateSecureRandomAlphanumericString(10);
      device.localPassword = password
      updateDeviceDto.password = password;
    } else if (updateDeviceDto.password) {
      device.localPassword = updateDeviceDto.password
    }

    await this.em.flush();
    return device;
  }

  async remove(id: string): Promise<void> {
    const device = await this.findOne(id);
    await this.em.removeAndFlush(device);
  }

  async updateDeviceInfo(
    device: DeviceEntity,
    updateDeviceDto: DeviceInformationDto,
  ): Promise<void> {
    this.logger.debug('Update device information for device with ID: ' + device.id);

    if (
      updateDeviceDto.deviceType &&
      ITGlueConfigurationType[updateDeviceDto.deviceType] === undefined
    ) {
      this.logger.error('Invalid device type');
      throw new BadRequestMTIException(MTIErrorCodes.DEVICE_TYPE_INVALID, `Device type is invalid`);
    }

    const operatingSystem = updateDeviceDto.operatingSystem?.replaceAll(' ', '');
    if (operatingSystem && ITGlueOperatingSystem[operatingSystem] === undefined) {
      this.logger.error('Invalid OperatingSystem ' + operatingSystem);
      throw new BadRequestMTIException(
        MTIErrorCodes.DEVICE_OS_INVALID,
        `Operating System is invalid`,
      );
    }
    const customer = await this.customersService.findOne(device.customer?.id);

    updateDeviceDto.operatingSystem = operatingSystem;

    const serialNumber = updateDeviceDto.serialNumber || device.serialNumber;
    updateDeviceDto.assetTag = updateDeviceDto.assetTag || device.assetTag;
    updateDeviceDto.serialNumber = serialNumber;

    updateDeviceDto.localPassword = updateDeviceDto.localPassword || device.localPassword;

    const itGlueDevice = await this.itGlue.upsertDevice(
      updateDeviceDto,
      customer.itGlueId,
      device.id,
    );
    device.itGlueId = itGlueDevice.id;
    device.serialNumber = serialNumber;

    device.assign(pick(updateDeviceDto, DeviceEntity));
    device.bitlockerId = updateDeviceDto.bitlockerId;
    device.bitlockerKey = updateDeviceDto.bitlockerKey;
    device.name = updateDeviceDto.name;

    await this.em.flush();
    this.logger.debug('Device information updated successfully');
  }
}
