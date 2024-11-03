import { Cascade, Collection, Embedded, Entity, OneToMany, Property } from "@mikro-orm/core";
import { DHCPServerConfigEntity } from "../dhcp/entities/dhcp-config.entity";
import { CoreBaseEntity } from "src/core/persistence/base.entity";
import { NetworkAddressEntity } from "./network-address.entity";

@Entity()
export class NetworkInterfaceEntity extends CoreBaseEntity {
    @Property({unique: true})
    name: string;

    @Property({unique: true})
    mac: string;

    @Embedded(() => DHCPServerConfigEntity, { nullable: true })
    dhcpConfig?: DHCPServerConfigEntity = new DHCPServerConfigEntity();

    @OneToMany(() => NetworkAddressEntity, address => address.interface, {eager: true, cascade: [Cascade.ALL], orphanRemoval: true})
    addresses = new Collection<NetworkAddressEntity>(this);
}