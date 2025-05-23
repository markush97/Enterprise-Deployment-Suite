import { request } from 'http';
import { catchError, firstValueFrom } from 'rxjs';
import { InternalMTIException } from 'src/core/errorhandling/exceptions/internal.mti-exception';
import { MTIErrorCodes } from 'src/core/errorhandling/exceptions/mti.error-codes.enum';
import { DeviceInformationDto } from 'src/devices/dto/update-device-info.dto';

import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';

import { SqlHighlighter } from '@mikro-orm/sql-highlighter';

import { ITGlueRequest } from './dto/itglue-request.dto';
import { ITGlueResponse, ITGlueResponseList } from './dto/itglue-searchresponse.dto';
import { ITGlueConfigurationAttributes } from './interfaces/configuration-attributes.interface';
import { ITGlueConfigurationType } from './interfaces/configuration-type.enum';
import { ITGlueConfiguration } from './interfaces/configuration.interface';
import { ITGlueType } from './interfaces/itglue-type.enum';
import { ITGlueBase } from './interfaces/itglue.base.interface';
import { ITGlueManufacturer } from './interfaces/itglue.manufacturer.interface';
import { ITGlueModel } from './interfaces/itglue.model.interface';
import { ITGlueOperatingSystem } from './interfaces/itglue.operatingsystems.enum';
import { ITGluePasswordCategories } from './interfaces/itglue.password-categories.enum';
import { ITGluePassword } from './interfaces/itglue.password.interface';
import { ITGlueModule } from './itglue.module';

@Injectable()
export class ITGlueService {
  private readonly logger = new Logger(ITGlueService.name);

  constructor(private readonly glue: HttpService) {}

  async getManufacturer(id: string): Promise<ITGlueManufacturer> {
    const { data } = await firstValueFrom(
      this.glue.get<ITGlueResponse<ITGlueManufacturer>>(`manufacturers/${id}`).pipe(
        catchError(error => {
          throw new InternalServerErrorException(
            `Error fetching manufacturer from ITGlue: ${error.message}`,
          );
        }),
      ),
    );

    if (!data || !data.data) {
      throw new InternalServerErrorException(`Manufacturer with ID ${id} not found`);
    }
    return data.data;
  }

  async getManufacturerByName(name: string): Promise<ITGlueManufacturer | null> {
    const { data } = await firstValueFrom(
      this.glue.get('manufacturers', { params: { filter: { name: name } } }).pipe(
        catchError(error => {
          throw new InternalServerErrorException(
            `Error fetching manufacturers from ITGlue: ${error.message}`,
          );
        }),
      ),
    );

    if (!data || !data.data || data.data.length < 1) {
      return null;
    }
    return data.data[0];
  }

  async getManufacturerByNameOrCreate(name: string): Promise<ITGlueManufacturer> {
    const manufacturer = await this.getManufacturerByName(name);
    if (manufacturer) {
      return manufacturer;
    }
    return this.createManufacturer(name);
  }

  async createManufacturer(name: string): Promise<ITGlueManufacturer> {
    this.logger.debug(`Fetching manufacturer with name ${name} from ITGlue`);
    const { data } = await firstValueFrom(
      this.glue
        .post<
          ITGlueResponse<ITGlueManufacturer>
        >('manufacturers', { data: { type: 'manufacturers', attributes: { name } } })
        .pipe(
          catchError(error => {
            throw new InternalServerErrorException(
              `Error creating manufacturer in ITGlue: ${error.message}`,
            );
          }),
        ),
    );
    return data.data;
  }

  async getModel(id: string): Promise<ITGlueModel> {
    const { data } = await firstValueFrom(
      this.glue.get<ITGlueResponse<ITGlueModel>>(`models/${id}`).pipe(
        catchError(error => {
          throw new InternalServerErrorException(
            `Error fetching manufacturer from ITGlue: ${error.message}`,
          );
        }),
      ),
    );

    if (!data || !data.data) {
      throw new InternalServerErrorException(`Manufacturer with ID ${id} not found`);
    }
    return data.data;
  }

  async getModelByName(name: string, manufacturerId: number): Promise<ITGlueModel | undefined> {
    this.logger.debug(`Fetching model with name ${name} from ITGlue`);
    // Fetching up to 5000 models from ITGlue to save the trouble of paginating
    const { data } = await firstValueFrom(
      this.glue
        .get<
          ITGlueResponseList<ITGlueModel>
        >(`/manufacturers/${manufacturerId}/relationships/models`, { params: { page: { size: 3000 } } })
        .pipe(
          catchError(error => {
            throw new InternalServerErrorException(
              `Error fetching models from ITGlue: ${error.message}`,
            );
          }),
        ),
    );

    let modelResult: ITGlueModel;
    if (data && data.data) {
      modelResult = data.data.find(model => model.attributes.name === name);
    }
    return modelResult;
  }

  async getModelByNameOrCreate(name: string, manufacturerId: number): Promise<ITGlueModel> {
    const model = await this.getModelByName(name, manufacturerId);
    if (model) {
      return model;
    }
    return this.createModel(name, manufacturerId);
  }

  async createModel(name: string, manufacturerId: number): Promise<ITGlueModel> {
    this.logger.debug(
      `Creating model with name ${name} for manufcaturerer ${manufacturerId} in ITGlue`,
    );
    const { data } = await firstValueFrom(
      this.glue
        .post<
          ITGlueResponse<ITGlueModel>
        >(`/manufacturers/${manufacturerId}/relationships/models`, { data: { type: 'models', attributes: { name } } })
        .pipe(
          catchError(error => {
            this.logger.error(error.message);
            throw new InternalServerErrorException(
              `Error creating models in ITGlue: ${error.message}`,
            );
          }),
        ),
    );
    return data.data;
  }

  async getDeviceBySerial(serial: string): Promise<any> {
    this.logger.debug(`Fetching device with serial number ${serial} from ITGlue`);
    const { data } = await firstValueFrom(
      this.glue
        .get<
          ITGlueResponseList<any>
        >('configurations', { params: { filter: { serial_number: serial } } })
        .pipe(
          catchError(error => {
            throw new InternalServerErrorException(
              `Error fetching device from ITGlue: ${error.message}`,
            );
          }),
        ),
    );

    if (!data || !data.data || data.data.length < 1) {
      return null;
    }

    if (data.data.length > 1) {
      this.logger.error(`Multiple devices found for serial number ${serial}`);
    }

    return data.data[0];
  }

  async upsertDevice(
    deviceInfo: DeviceInformationDto,
    itGlueCustomerId: number,
    deviceId: string,
  ): Promise<ITGlueConfiguration> {
    const itGlueDevice = await this.getDeviceBySerial(deviceInfo.serialNumber);

    if (!itGlueDevice) {
      this.logger.debug('Device not found in ITGlue, creating new device');
      const newDevice = await this.createDevice(deviceInfo, itGlueCustomerId, deviceId);
      if (deviceInfo.bitlockerId && deviceInfo.bitlockerKey) {
        await this.createBitlockerPassword(
          newDevice,
          deviceInfo.bitlockerId,
          deviceInfo.bitlockerKey,
        );
      }
      return newDevice;
    } else {
      this.logger.debug('Device found in ITGlue, updating device');
      const updatedDevice = await this.updateDevice(itGlueDevice, deviceInfo, deviceId);
      if (deviceInfo.bitlockerId && deviceInfo.bitlockerKey) {
        await this.upsertBitlockerPassword(
          itGlueDevice,
          deviceInfo.bitlockerId,
          deviceInfo.bitlockerKey,
        );
      }
      return updatedDevice;
    }
  }

  async updateDevice(
    itGlueDevice: ITGlueConfiguration,
    deviceInfo: Partial<DeviceInformationDto>,
    deviceId: string,
  ): Promise<ITGlueConfiguration> {
    this.logger.debug(`Updating device with serial number ${deviceInfo.serialNumber} in ITGlue`);

    const requestData = await this.prepareDeviceInfo(deviceInfo, deviceId, itGlueDevice);
    const { data } = await firstValueFrom(
      this.glue
        .patch<
          ITGlueResponse<ITGlueConfiguration>
        >(`/configurations/${itGlueDevice.id}`, requestData)
        .pipe(
          catchError(error => {
            this.logger.error(error.message);
            throw new InternalMTIException(
              MTIErrorCodes.ERROR_COMMUNICATING_WITH_ITGLUE,
              `Error creating device in ITGlue`,
            );
          }),
        ),
    );

    return data.data;
  }

  async createDevice(
    deviceInfo: DeviceInformationDto,
    itGlueCustomerId: number,
    deviceId: string,
  ): Promise<ITGlueConfiguration> {
    this.logger.debug(`Creating device with serial number ${deviceInfo.serialNumber} in ITGlue`);

    const requestData = await this.prepareDeviceInfo(deviceInfo, deviceId);
    const { data } = await firstValueFrom(
      this.glue
        .post<
          ITGlueResponse<ITGlueConfiguration>
        >(`/organizations/${itGlueCustomerId}/relationships/configurations`, requestData)
        .pipe(
          catchError(error => {
            this.logger.error(error.message);
            throw new InternalMTIException(
              MTIErrorCodes.ERROR_COMMUNICATING_WITH_ITGLUE,
              `Error creating device in ITGlue`,
            );
          }),
        ),
    );

    return data.data;
  }

  private async prepareDeviceInfo(
    newDeviceInfos: Partial<DeviceInformationDto>,
    deviceId: string,
    currentDeviceInfos?: ITGlueConfiguration,
  ): Promise<ITGlueRequest<ITGlueConfiguration>> {
    const attributes: ITGlueConfigurationAttributes = this.mapDeviceInfo(
      newDeviceInfos,
      deviceId,
      currentDeviceInfos,
    );

    if (newDeviceInfos.manufacturer) {
      const manufacturer = await this.getManufacturerByNameOrCreate(newDeviceInfos.manufacturer);
      attributes['manufacturer-id'] = manufacturer.id;

      if (newDeviceInfos.model) {
        const model = await this.getModelByNameOrCreate(newDeviceInfos.model, manufacturer.id);
        attributes['model-id'] = model.id;
      }
    }
    return { data: { type: ITGlueType.CONFIGURATION, attributes } };
  }

  private async getBitlockerPassword(
    itGlueDevice: ITGlueConfiguration,
  ): Promise<ITGluePassword | null> {
    this.logger.debug(
      `Fetching Bitlocker password for device with ID ${itGlueDevice.attributes.name} in ITGlue`,
    );

    const { data } = await firstValueFrom(
      this.glue
        .get<
          ITGlueResponseList<ITGluePassword>
        >(`/organizations/${itGlueDevice.attributes['organization-id']}/relationships/passwords`, { params: { filter: { name: `${itGlueDevice.attributes.name} - Bitlocker` } } })
        .pipe(
          catchError(error => {
            this.logger.error(error.message);
            throw new InternalMTIException(
              MTIErrorCodes.ERROR_COMMUNICATING_WITH_ITGLUE,
              `Error getting bitlocker in ITGlue`,
            );
          }),
        ),
    );

    if (!data || !data.data || data.data.length < 1) {
      return null;
    }

    return data.data[0];
  }

  private async upsertBitlockerPassword(
    itGlueDevice: ITGlueConfiguration,
    bitlockerId: string,
    bitlockerKey: string,
  ): Promise<void> {
    this.logger.debug(
      `Setting Bitlocker password for device with ID ${itGlueDevice.attributes.name} in ITGlue`,
    );

    const requestData = {
      data: {
        type: ITGlueType.PASSWORDS,
        attributes: {
          name: `${itGlueDevice.attributes.name} - Bitlocker`,
          username: bitlockerId,
          password: bitlockerKey,
          'password-category-id': ITGluePasswordCategories.BITLOCKER,
          'resource-type': ITGlueType.CONFIGURATION,
          'resource-id': itGlueDevice.id,
        },
      },
    };

    const existingPassword = await this.getBitlockerPassword(itGlueDevice);
    if (existingPassword) {
      this.logger.debug(
        `Updating Bitlocker password for device with ID ${itGlueDevice.attributes.name} in ITGlue`,
      );

      await firstValueFrom(
        this.glue
          .patch<
            ITGlueResponse<ITGlueConfiguration>
          >(`/passwords/${existingPassword.id}`, requestData)
          .pipe(
            catchError(error => {
              this.logger.error(error.message);
              throw new InternalMTIException(
                MTIErrorCodes.ERROR_COMMUNICATING_WITH_ITGLUE,
                `Error updating bitlocker in ITGlue`,
              );
            }),
          ),
      );

      return;
    }

    await this.createBitlockerPassword(itGlueDevice, bitlockerId, bitlockerKey);
  }

  private readonly createBitlockerPassword = async (
    itGlueDevice: ITGlueConfiguration,
    bitlockerId: string,
    bitlockerKey: string,
  ): Promise<void> => {
    this.logger.debug(
      `Creating Bitlocker password for device with ID ${itGlueDevice.attributes.name} in ITGlue`,
    );
    const requestData = {
      data: {
        type: ITGlueType.PASSWORDS,
        attributes: {
          name: `${itGlueDevice.attributes.name} - Bitlocker`,
          username: bitlockerId,
          password: bitlockerKey,
          'password-category-id': ITGluePasswordCategories.BITLOCKER,
          'resource-type': 'Configuration',
          'resource-id': itGlueDevice.id,
        },
      },
    };

    await firstValueFrom(
      this.glue
        .post<
          ITGlueResponse<ITGlueConfiguration>
        >(`/organizations/${itGlueDevice.attributes['organization-id']}/relationships/passwords`, requestData)
        .pipe(
          catchError(error => {
            this.logger.error(error.message);
            this.logger.debug(error.response.data);
            console.log(requestData);
            throw new InternalMTIException(
              MTIErrorCodes.ERROR_COMMUNICATING_WITH_ITGLUE,
              `Error creating bitlocker in ITGlue`,
            );
          }),
        ),
    );
  };

  private readonly mapDeviceInfo = (
    newDeviceInfos: Partial<DeviceInformationDto>,
    deviceId: string,
    currentDeviceInfos?: ITGlueConfiguration,
  ): ITGlueConfigurationAttributes => ({
    'serial-number': newDeviceInfos.serialNumber,
    'asset-tag': newDeviceInfos.assetTag,
    'installed-by': newDeviceInfos.installedBy,
    'configuration-type-id': ITGlueConfigurationType[newDeviceInfos.deviceType],
    'operating-system-id': ITGlueOperatingSystem[newDeviceInfos.operatingSystem],
    'operating-system-notes': this.mapOperatingSystemNotes(
      currentDeviceInfos?.attributes['operating-system-notes'],
      newDeviceInfos.operatingSystemNotes,
    ),
    name: newDeviceInfos.name,
    notes: this.mapNotes(currentDeviceInfos?.attributes.notes, deviceId, newDeviceInfos.notes),
  });

  private readonly mapNotes = (
    currentNotes: string = '',
    deviceId: string,
    newNotes = '',
  ): string => {
    currentNotes === null ? (currentNotes = '') : currentNotes;
    const notes = currentNotes.split('#### DO NOT EDIT BELOW THIS LINE ####')[0];
    return `${notes.trimEnd()}
${newNotes}
#### DO NOT EDIT BELOW THIS LINE ####
Created automatically by EDS-Imaging.
EDS-Device ID: ${deviceId}
Last updated: ${new Date().toLocaleString('de-AT')}`;
  };

  private readonly mapOperatingSystemNotes = (currentNotes: string = '', newNotes = ''): string => {
    currentNotes === null ? (currentNotes = '') : currentNotes;

    const notes = currentNotes.split('#### DO NOT EDIT BELOW THIS LINE ####')[0];
    return `${notes.trimEnd()}
#### DO NOT EDIT BELOW THIS LINE ####
${newNotes}
`;
  };
}
