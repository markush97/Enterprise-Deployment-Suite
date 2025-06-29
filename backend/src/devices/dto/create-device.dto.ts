import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
  serialNumber: string;

  @ApiProperty()
  @IsOptional()
  customerId?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  createdBy: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  bitlockerKey?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  osVersion?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  imageName?: string;
}
