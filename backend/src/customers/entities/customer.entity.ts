import { Entity, Property, Collection, OneToMany } from '@mikro-orm/core';
import { BaseEntity } from '../../shared/base.entity';
import { Device } from '../../devices/entities/device.entity';
import { VpnProfile } from '../../vpn/entities/vpn-profile.entity';

@Entity()
export class Customer extends BaseEntity {
  @Property()
  name: string;

  @Property()
  shortCode: string;

  @Property()
  pulsewayId: string;

  @Property({ type: 'json' })
  settings: {
    defaultClientImage?: string;
    defaultServerImage?: string;
  };

  @OneToMany(() => Device, device => device.customer)
  devices = new Collection<Device>(this);

  @OneToMany(() => VpnProfile, profile => profile.customer)
  vpnProfiles = new Collection<VpnProfile>(this);
}