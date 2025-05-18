import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios'
import { catchError, firstValueFrom } from 'rxjs';
import { ITGlueManufacturer } from './interfaces/itglue.manufacturer';
import { ITGlueBase } from './interfaces/itglue.base';
import { ITGlueResponse, ITGlueResponseList } from './dto/itglue-searchresponse.dto';
import { ITGlueModule } from './itglue.module';
import { ITGlueModel } from './interfaces/itglue.model';

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
        const newManufacturer = await this.createManufacturer(name);
    }

    async createManufacturer(name: string): Promise<ITGlueManufacturer> {
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
        const { data } = await firstValueFrom(this.glue.get('models', { params: { filter: { name: name } } }).pipe(catchError((error) => {
            throw new InternalServerErrorException(`Error fetching manufacturers from ITGlue: ${error.message}`);
        })));

        if (!data || !data.data || data.data.length < 1) {
            return null;
        }
        return data.data[0];
    }

    async getModelByNameOrCreate(name: string): Promise<ITGlueModel> {
        const manufacturer = await this.getModelByName(name);
        if (manufacturer) {
            return manufacturer;
        }
        return this.createModel(name);
    }

    async createModel(name: string): Promise<ITGlueModel> {
        const { data } = await firstValueFrom(this.glue.post<ITGlueResponse<ITGlueModel>>('models', { data: { type: 'models', attributes: { name } } }).pipe(catchError((error) => {
            throw new InternalServerErrorException(`Error creating manufacturer in ITGlue: ${error.message}`);
        })));
        return data.data;
    }

    async getDeviceBySerial(serial: string): Promise<any> {
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

    async createDevice(device: any): Promise<any> {
        const { data } = await firstValueFrom(this.glue.post('configurations', device).pipe(catchError((error) => {
            throw new InternalServerErrorException(`Error creating device in ITGlue: ${error.message}`);
        })));

        return data;
    }
}
