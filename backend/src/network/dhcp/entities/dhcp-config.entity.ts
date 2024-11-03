import { Embeddable, Embedded, Entity, OneToOne, Property } from "@mikro-orm/core";
import { CoreBaseEntity } from "src/core/persistence/base.entity";
import { NetworkInterfaceEntity } from "src/network/entities/network-interface.entity";

@Embeddable()
export class DHCPBootFilesEntity {
    @Property()
    bios: string = 'grub/grub.pxe';

    @Property()
    efiAMDx64: string = 'grub/grubx64_amd.efi';

    @Property()
    efiAMDx86: string = 'grub/grubx86_amd.efi'

    @Property()
    efiARMx64: string = 'grub/grubx64_arm.efi'

}

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
    domainName: string;

    @Property()
    tftpServer: string;

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

    @Embedded()
    bootFiles: DHCPBootFilesEntity = new DHCPBootFilesEntity();
}