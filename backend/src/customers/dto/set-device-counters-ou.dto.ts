import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class SetDeviceCountersAndOUsDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  deviceCounterPc?: number;

  @IsOptional()
  @IsString()
  deviceOUPc?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  deviceCounterNb?: number;

  @IsOptional()
  @IsString()
  deviceOUNb?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  deviceCounterTab?: number;

  @IsOptional()
  @IsString()
  deviceOUTab?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  deviceCounterMac?: number;

  @IsOptional()
  @IsString()
  deviceOUMac?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  deviceCounterSrv?: number;

  @IsOptional()
  @IsString()
  deviceOUSrv?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  deviceCounterDiv?: number;

  @IsOptional()
  @IsString()
  deviceOUDiv?: string;
}
