import { IsString, IsNotEmpty, IsObject, IsOptional } from 'class-validator';
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
  @IsString()
  @IsNotEmpty()
  pulsewayId: string;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  settings?: {
    defaultClientImage?: string;
    defaultServerImage?: string;
  };
}