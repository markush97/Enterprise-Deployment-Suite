import { IsEnum, IsIn, IsIP, IsMACAddress, IsOptional } from "class-validator";

export class ClientInfoDto {

    @IsOptional()
    clientSerialNumber: string;

    @IsOptional()
    @IsIP()
    clientIp: string;

    @IsOptional()
    @IsIn(['UEFI', 'PC'])
    clientPlatform: 'UEFI' | 'PC'
}
