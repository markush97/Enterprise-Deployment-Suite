import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
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
