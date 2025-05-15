import { IsString, IsNotEmpty, IsEnum, IsOptional, Allow } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DeviceType } from '../entities/device.entity';

export class DeviceInformationDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  bitlockerKey?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  bitlockerId?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  operatingSystem?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  serialNumber?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  deviceType?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  plattform?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  manufacturer?: string;

  @ApiProperty()
  @Allow()
  networkInterfaces?: string;

  @ApiProperty()
  @Allow()
  collectionTime?: string;

}
