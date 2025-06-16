import { IsOptional, IsUUID } from 'class-validator';

export class UpdateJobDto {
  @IsUUID('4')
  @IsOptional()
  taskBundleId?: string;

  @IsUUID('4')
  @IsOptional()
  customerId?: string;
}
