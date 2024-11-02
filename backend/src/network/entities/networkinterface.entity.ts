import { Embedded, Entity, Property } from "@mikro-orm/core";
import { DHCPServerConfigEntity } from "../dhcp/entities/dhcp-config.entity";
import { CoreBaseEntity } from "src/core/persistence/base.entity";

@Entity()
export class NetworkInterfaceEntity extends CoreBaseEntity {
    @Property()
    name: string;

    @Property()
    mac: string;

    @Embedded({nullable: true})
    dhcpConfig: DHCPServerConfigEntity
}