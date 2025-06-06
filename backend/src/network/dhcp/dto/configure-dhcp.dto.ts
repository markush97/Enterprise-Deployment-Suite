import { IsBoolean, IsFQDN, IsIP, IsNumber, IsOptional, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class ConfigureDHCPDto {
  @ApiProperty()
  @IsOptional()
  port = 67;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  leaseTime = 3600;

  @ApiProperty()
  @IsIP('4', { each: true })
  range: [string, string];

  @ApiProperty()
  @IsFQDN()
  @IsOptional()
  domainName: string;

  @ApiProperty()
  @IsIP()
  @IsOptional()
  timeServer: string;

  @ApiProperty()
  @IsIP('4', { each: true })
  @IsOptional()
  router: string[];

  @ApiProperty()
  @IsIP('4', { each: true })
  @IsOptional()
  dns: string[];

  @ApiProperty()
  @IsBoolean()
  active: boolean;

  @ApiProperty()
  @IsString()
  @IsOptional()
  tftpServer: string;
}
