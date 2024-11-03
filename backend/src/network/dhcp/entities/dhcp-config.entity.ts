import { Embeddable, Property } from "@mikro-orm/core";

@Embeddable()
export class DHCPServerConfigEntity {
    @Property()
    port = 67

    @Property()
    leaseTime = 3600;

    @Property()
    range?: [string, string];

    @Property()
    broadcast?: string;

    @Property()
    domainName?: string;

    @Property()
    nameServer?: string;

    @Property()
    timeServer?: string;

    @Property()
    router?: string[];

    @Property()
    dns?: string[];

    @Property()
    active = false;
}