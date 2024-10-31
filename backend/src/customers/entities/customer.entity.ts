import { Entity, Property, Collection, OneToMany } from '@mikro-orm/core';
import { Device } from '../../devices/entities/device.entity';
import { VpnProfile } from '../../vpn/entities/vpn-profile.entity';
import { CoreBaseEntity } from 'src/core/persistence/base.entity';

@Entity()
export class Customer extends CoreBaseEntity {
  @Property()
  name: string;

  @Property()
  shortCode: string;

  @Property()
  zohoId: string;

  @OneToMany(() => Device, device => device.customer)
  devices = new Collection<Device>(this);

  @OneToMany(() => VpnProfile, profile => profile.customer)
  vpnProfiles = new Collection<VpnProfile>(this);
}