// src/types/customer.interface.ts
export interface CustomerSettings {
    defaultClientImage?: string;
}

export interface DomainJoinCredentials {
    username: string;
    password: string;
}

export interface Customer {
    adDomain?: string;
    id: string;
    name: string;
    shortCode: string;
    createdAt: string;
    rmmId: number,
    zohoId: number;
    itGlueId: number;
    deviceCounterPc: number;
    deviceOUPc?: string;
    deviceCounterNb: number;
    deviceOUNb?: string;
    deviceCounterTab: number;
    deviceOUTab?: string;
    deviceCounterMac: number;
    deviceOUMac?: string;
    deviceCounterSrv: number;
    deviceOUSrv?: string;
    deviceCounterDiv: number;
    deviceOUDiv?: string;
    deviceEnrollmentCredentials?: DomainJoinCredentials;
    pulsewayDownloadUrl?: string;
    bitdefenderDownloadUrl?: string;
}
