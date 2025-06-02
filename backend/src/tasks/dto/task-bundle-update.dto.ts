import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateTaskBundleDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsBoolean()
  @IsOptional()
  global: boolean;
}
