import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  shortCode: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  zohoId: number;

  @ApiProperty()
  @IsNumber()
  rmmId: number;

  @ApiProperty()
  @IsNumber()
  itGlueId: number;

  @ApiProperty()
  @IsOptional()
  @IsUrl()
  pulsewayDownloadUrl?: string;

  @ApiProperty()
  @IsOptional()
  @IsUrl()
  bitdefenderDownloadUrl?: string;
}
