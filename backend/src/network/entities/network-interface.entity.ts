import { Cascade, 
    Embedded, Entity, OneToMany, OneToOne, Property } from "@mikro-orm/core";
import { DHCPServerConfigEntity } from "../dhcp/entities/dhcp-config.entity";
import { CoreBaseEntity } from "src/core/persistence/base.entity";
import { NetworkAddress } from "../networkInterface.interface";
import { NetworkAddressEntity } from "./network-address.entity";

@Entity()
export class NetworkInterfaceEntity extends CoreBaseEntity {
    @Property({ unique: true })
    name: string;

    @Property({ unique: true })
    mac: string;

    @OneToOne(() => DHCPServerConfigEntity, { nullable: true, eager: true, cascade: [Cascade.ALL] })
    dhcpConfig?: DHCPServerConfigEntity;

    @Embedded({ entity: () => NetworkAddressEntity, array: true })
    addresses: NetworkAddress[] = [];
}