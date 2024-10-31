import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DeviceType } from '../entities/device.entity';

export class CreateDeviceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: DeviceType })
  @IsEnum(DeviceType)
  type: DeviceType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  createdBy: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  macAddress: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  bitlockerKey: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  osVersion: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  imageName: string;
}