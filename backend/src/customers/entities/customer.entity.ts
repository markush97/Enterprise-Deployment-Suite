import { CoreBaseEntity } from 'src/core/persistence/base.entity';
import { generateSecureRandomString } from 'src/core/utils/crypto.helper';
import { TasksEntity } from 'src/tasks/entities/task.entity';

import {
  Collection,
  Embeddable,
  Embedded,
  Entity,
  ManyToMany,
  OneToMany,
  Property,
} from '@mikro-orm/core';

import { DeviceEntity } from '../../devices/entities/device.entity';
import { VpnProfile } from '../../vpn/entities/vpn-profile.entity';

@Embeddable()
export class DeviceEnrollmentCredentials {
  @Property()
  username: string;

  @Property()
  password: string;

  @Property()
  domain: string;
}

@Entity()
export class CustomerEntity extends CoreBaseEntity {
  @Property()
  name: string;

  @Property()
  shortCode: string;

  @Property()
  zohoId: number;

  @Property()
  rmmId: number;

  @Property()
  itGlueId: number;

  @Property({ nullable: true })
  adDomain: string;

  @OneToMany(() => DeviceEntity, device => device.customer)
  devices = new Collection<DeviceEntity>(this);

  @OneToMany(() => VpnProfile, profile => profile.customer)
  vpnProfiles = new Collection<VpnProfile>(this);

  @ManyToMany(() => TasksEntity, task => task.customers, { owner: true })
  tasks = new Collection<TasksEntity>(this);

  @Property()
  deviceCounterPc: number = 0;

  @Property({ nullable: true })
  deviceOUPc: string;

  @Property()
  deviceCounterNb: number = 0;

  @Property({ nullable: true })
  deviceOUNb: string;

  @Property()
  deviceCounterTab: number = 0;

  @Property({ nullable: true })
  deviceOUTab: string;

  @Property()
  deviceCounterMac: number = 0;

  @Property({ nullable: true })
  deviceOUMac: string;

  @Property()
  deviceCounterSrv: number = 0;

  @Property({ nullable: true })
  deviceOUSrv: string;

  @Property()
  deviceCounterDiv: number = 0;

  @Property({ nullable: true })
  deviceOUDiv: string;

  @Property({ hidden: true })
  localAdministratorPassword: string = generateSecureRandomString(10);

  @Embedded(() => DeviceEnrollmentCredentials, { nullable: true })
  deviceEnrollmentCredentials?: DeviceEnrollmentCredentials;
}
