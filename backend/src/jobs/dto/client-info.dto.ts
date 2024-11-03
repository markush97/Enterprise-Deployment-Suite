import { IsEnum, IsIn, IsIP, IsMACAddress, IsOptional } from "class-validator";

export class ClientInfoDto {

    @IsOptional()
    @IsMACAddress()
    clientMac: string;

    @IsOptional()
    @IsIP()
    clientIp: string;

    @IsOptional()
    @IsIn(['UEFI', 'PC'])
    clientPlatform: 'UEFI' | 'PC'
}