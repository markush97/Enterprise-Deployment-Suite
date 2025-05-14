import { Entity, Property, Collection, OneToMany } from '@mikro-orm/core';
import { DeviceEntity } from '../../devices/entities/device.entity';
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

  @OneToMany(() => DeviceEntity, device => device.customer)
  devices = new Collection<DeviceEntity>(this);

  @OneToMany(() => VpnProfile, profile => profile.customer)
  vpnProfiles = new Collection<VpnProfile>(this);

  @Property()
  deviceCounterPc: number = 0;

  @Property()
  deviceCounterNb: number = 0;

  @Property()
  deviceCounterTab: number = 0;

  @Property()
  deviceCounterMac: number = 0;

  @Property()
  deviceCounterSrv: number = 0;

  @Property()
  deviceCounterDiv: number = 0;
}
