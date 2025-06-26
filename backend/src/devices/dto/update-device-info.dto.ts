import { Allow, IsBoolean, IsOptional, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class DeviceInformationDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  bitlockerKey?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  assetTag?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  installedBy?: string;

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
  operatingSystemNotes?: string;

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
  @IsString()
  @IsOptional()
  model?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty()
  @Allow()
  networkInterfaces?: string;

  @ApiProperty()
  @Allow()
  collectionTime?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  localPassword?: string;
}
