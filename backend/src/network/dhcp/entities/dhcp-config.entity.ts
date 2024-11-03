import { Embeddable, Entity, OneToOne, Property } from "@mikro-orm/core";
import { CoreBaseEntity } from "src/core/persistence/base.entity";
import { NetworkInterfaceEntity } from "src/network/entities/network-interface.entity";

@Entity()
export class DHCPServerConfigEntity extends CoreBaseEntity {
    @Property()
    port = 67

    @Property()
    leaseTime = 3600;

    @Property()
    range: [string, string];

    @Property()
    broadcast: string;

    @Property()
    domainName = "enterprise-deployment.local";

    @Property({nullable: true})
    timeServer?: string;

    @Property()
    router: string[];

    @Property()
    dns: string[];

    @Property()
    active = false;

    @OneToOne(() => NetworkInterfaceEntity, {eager: true})
    interface: NetworkInterfaceEntity;

}