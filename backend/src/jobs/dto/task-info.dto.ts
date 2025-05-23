import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class TaskInfoDto {
  @IsString()
  @IsNotEmpty()
  taskId: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsString()
  error?: string;

  @IsOptional()
  @IsString()
  progress?: string;

  @IsOptional()
  @IsString()
  result?: string;
}
