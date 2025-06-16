import { IsDateString, IsEnum, IsJSON, IsOptional, IsString, IsUUID } from 'class-validator';

export class JobLogDataDto {
  @IsString()
  message: string;

  @IsJSON()
  @IsOptional()
  meta?: Record<string, any>;

  @IsDateString()
  timestamp: string;

  @IsUUID('4')
  jobId: string;

  @IsUUID('4')
  @IsOptional()
  taskId?: string;

  @IsEnum(['info', 'warn', 'error', 'debug'])
  level: 'info' | 'warn' | 'error' | 'debug';
}
