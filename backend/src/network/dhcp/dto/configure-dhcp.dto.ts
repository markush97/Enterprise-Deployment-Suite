import { IsString, IsNotEmpty, IsNumber, IsArray, IsIP, IsPort, IsUrl, IsFQDN } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfigureDHCPDto {
  @ApiProperty()
  @IsPort()
  port = 67

  @ApiProperty()
  @IsNumber()
  leaseTime = 3600;

  @ApiProperty()
  @IsArray()
  @IsIP()
  range: [string, string];

  @ApiProperty()
  @IsFQDN()
  domainName: string;
  
  @ApiProperty()
  @IsIP()
  nameServer: string;
  
  @ApiProperty()
  @IsIP()
  timeServer: string;
  
  @ApiProperty()
  @IsIP()
  router: string[];
  
  @ApiProperty()
  @IsArray()
  @IsIP()
  dns: string[];
}