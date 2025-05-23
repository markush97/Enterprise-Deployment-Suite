import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { VpnType } from '../entities/vpn-profile.entity';

export class CreateVpnProfileDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: VpnType })
  @IsEnum(VpnType)
  type: VpnType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  hostname: string;

  @ApiProperty()
  @IsNumber()
  port: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  encryptedPassword?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  protocol: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  testIp: string;

  @ApiProperty()
  @IsBoolean()
  isDefault: boolean = false;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  wireGuardConfig?: {
    privateKey: string;
    publicKey: string;
    endpoint: string;
    allowedIPs: string[];
    persistentKeepalive: number;
  };
}
