import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateTaskBundleDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsBoolean()
  global: boolean;
}
