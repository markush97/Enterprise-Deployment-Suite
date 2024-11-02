export interface DHCPServerConfig {
    port: number
    leaseTime:number ;
    range: [string, string];
    domainName: string;
    nameServer: string;
    timeServer: string;
    router: string[];
    dns: string[];
}