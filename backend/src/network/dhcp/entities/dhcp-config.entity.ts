import { Embeddable } from "@mikro-orm/core";

@Embeddable()
export class DHCPServerConfigEntity {
    port = 67
    leaseTime = 3600;
    range: [string, string];
    domainName: string;
    nameServer: string;
    timeServer: string;
    router: string[];
    dns: string[];
}