import { IsOptional, IsString } from 'class-validator';
import { DeviceType } from 'src/devices/entities/device.entity';

export class RegisterJobDto {
  @IsString()
  @IsOptional()
  organizationId: string;

  @IsString()
  deviceSerial: string;

  @IsString()
  deviceName: string;

  @IsString()
  deviceType: DeviceType;
}
