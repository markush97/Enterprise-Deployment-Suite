import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios'
import { catchError, firstValueFrom } from 'rxjs';
import { ITGlueManufacturer } from './interfaces/itglue.manufacturer.interface';
import { ITGlueBase } from './interfaces/itglue.base.interface';
import { ITGlueResponse, ITGlueResponseList } from './dto/itglue-searchresponse.dto';
import { ITGlueModule } from './itglue.module';
import { ITGlueModel } from './interfaces/itglue.model.interface';
import { ITGlueConfiguration } from './interfaces/configuration.interface';
import { ITGlueConfigurationAttributes } from './interfaces/configuration-attributes.interface';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { DeviceInformationDto } from 'src/devices/dto/update-device-info.dto';
import { ITGlueType } from './interfaces/itglue-type.enum';
import { InternalMTIException } from 'src/core/errorhandling/exceptions/internal.mti-exception';
import { MTIErrorCodes } from 'src/core/errorhandling/exceptions/mti.error-codes.enum';
import { ITGlueConfigurationType } from './interfaces/configuration-type.enum';
import { ITGlueRequest } from './dto/itglue-request.dto';

@Injectable()
export class ITGlueService {
    private readonly logger = new Logger(ITGlueService.name);

    constructor(private readonly glue: HttpService) { }

    async getManufacturer(id: string): Promise<ITGlueManufacturer> {
        const { data } = await firstValueFrom(this.glue.get<ITGlueResponse<ITGlueManufacturer>>(`manufacturers/${id}`).pipe(catchError((error) => {
            throw new InternalServerErrorException(`Error fetching manufacturer from ITGlue: ${error.message}`);
        })));

        if (!data || !data.data) {
            throw new InternalServerErrorException(`Manufacturer with ID ${id} not found`);
        }
        return data.data;
    }

    async getManufacturerByName(name: string): Promise<ITGlueManufacturer | null> {
        const { data } = await firstValueFrom(this.glue.get('manufacturers', { params: { filter: { name: name } } }).pipe(catchError((error) => {
            throw new InternalServerErrorException(`Error fetching manufacturers from ITGlue: ${error.message}`);
        })));

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
        const { data } = await firstValueFrom(this.glue.post<ITGlueResponse<ITGlueManufacturer>>('manufacturers', { data: { type: 'manufacturers', attributes: { name } } }).pipe(catchError((error) => {
            throw new InternalServerErrorException(`Error creating manufacturer in ITGlue: ${error.message}`);
        })));
        return data.data;
    }

    async getModel(id: string): Promise<ITGlueModel> {
        const { data } = await firstValueFrom(this.glue.get<ITGlueResponse<ITGlueModel>>(`models/${id}`).pipe(catchError((error) => {
            throw new InternalServerErrorException(`Error fetching manufacturer from ITGlue: ${error.message}`);
        })));

        if (!data || !data.data) {
            throw new InternalServerErrorException(`Manufacturer with ID ${id} not found`);
        }
        return data.data;
    }

    async getModelByName(name: string): Promise<ITGlueModel | null> {
        this.logger.debug(`Fetching model with name ${name} from ITGlue`);
        const { data } = await firstValueFrom(this.glue.get('models', { params: { filter: { name: name } } }).pipe(catchError((error) => {
            throw new InternalServerErrorException(`Error fetching models from ITGlue: ${error.message}`);
        })));

        if (!data || !data.data || data.data.length < 1) {
            return null;
        }
        return data.data[0];
    }

    async getModelByNameOrCreate(name: string): Promise<ITGlueModel> {
        const model = await this.getModelByName(name);
        if (model) {
            return model;
        }
        return this.createModel(name);
    }

    async createModel(name: string): Promise<ITGlueModel> {
        const { data } = await firstValueFrom(this.glue.post<ITGlueResponse<ITGlueModel>>('models', { data: { type: 'models', attributes: { name } } }).pipe(catchError((error) => {
            throw new InternalServerErrorException(`Error creating models in ITGlue: ${error.message}`);
        })));
        return data.data;
    }

    async getDeviceBySerial(serial: string): Promise<any> {
        this.logger.debug(`Fetching device with serial number ${serial} from ITGlue`);
        const { data } = await firstValueFrom(this.glue.get<ITGlueResponseList<any>>('configurations', { params: { filter: { serial_number: serial } } }).pipe(catchError((error) => {
            throw new InternalServerErrorException(`Error fetching device from ITGlue: ${error.message}`);

        })));

        if (!data || !data.data || data.data.length < 1) {
            return null;
        }

        if (data.data.length > 1) {
            this.logger.error(`Multiple devices found for serial number ${serial}`);
        }

        return data.data[0];
    }

    async updateDevice(itGlueDevice: ITGlueConfiguration, deviceInfo: Partial<DeviceInformationDto>, deviceId: string): Promise<ITGlueConfiguration> {
        this.logger.debug(`Updating device with serial number ${deviceInfo.serialNumber} in ITGlue`);

        const requestData = await this.prepareDeviceInfo(deviceInfo, deviceId)
        const { data } = await firstValueFrom(this.glue.patch<ITGlueResponse<ITGlueConfiguration>>(`/configurations/${itGlueDevice.id}`, requestData).pipe(catchError((error) => {
            this.logger.error(error.message);
            throw new InternalMTIException(MTIErrorCodes.ERROR_COMMUNICATING_WITH_ITGLUE, `Error creating device in ITGlue`);
        })));

        return data.data;
    }

    async createDevice(deviceInfo: DeviceInformationDto, itGlueCustomerId: number, deviceId: string): Promise<ITGlueConfiguration> {
        this.logger.debug(`Creating device with serial number ${deviceInfo.serialNumber} in ITGlue`);

        const requestData = await this.prepareDeviceInfo(deviceInfo, deviceId)
        const { data } = await firstValueFrom(this.glue.post<ITGlueResponse<ITGlueConfiguration>>(`/organizations/${itGlueCustomerId}/relationships/configurations`, requestData).pipe(catchError((error) => {
            this.logger.error(error.message);
            throw new InternalMTIException(MTIErrorCodes.ERROR_COMMUNICATING_WITH_ITGLUE, `Error creating device in ITGlue`);
        })));

        return data.data;
    }

    private async prepareDeviceInfo(deviceInfo: Partial<DeviceInformationDto>, deviceId: string): Promise<ITGlueRequest<ITGlueConfiguration>> {
        const attributes: ITGlueConfigurationAttributes = this.mapDeviceInfo(deviceInfo, deviceId);

        if (!!deviceInfo.manufacturer) {
            const manufacturer = await this.getManufacturerByNameOrCreate(deviceInfo.manufacturer);
            attributes["manufacturer-id"] = manufacturer.id;

            if (!!deviceInfo.model) {
                const model = await this.getModelByNameOrCreate(deviceInfo.model);
                attributes["model-id"] = model.id;
            }
        }

        return { data: { type: ITGlueType.CONFIGURATION, attributes } }
    }

    private readonly mapDeviceInfo = (deviceInfo: Partial<DeviceInformationDto>, deviceId: string, oldNotes: string = ""): ITGlueConfigurationAttributes => ({
        "serial-number": deviceInfo.serialNumber,
        "asset-tag": deviceInfo.assetTag,
        "installed-by": deviceInfo.installedBy,
        "configuration-type-id": ITGlueConfigurationType[deviceInfo.deviceType],
        "name": deviceInfo.name,
        "notes": this.mapNotes(oldNotes, deviceId, deviceInfo.notes),
    })

    private readonly mapNotes = (currentNotes: string, deviceId: string, newNotes = ""): string => {
        const notes = currentNotes.split('#### DO NOT EDIT BELOW THIS LINE ####')[0];
        return `${notes}
${newNotes}
#### DO NOT EDIT BELOW THIS LINE ####
Created automatically by EDS-Imaging.
EDS-Device ID: ${deviceId}
Last updated: ${new Date().toLocaleString('de-AT')}`
    }
}
