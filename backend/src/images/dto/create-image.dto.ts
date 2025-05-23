import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateImageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  version: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  distribution: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  buildNumber: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  imagePath: string;

  @ApiProperty()
  @IsNumber()
  size: number;
}
