import { CoreBaseEntity } from 'src/core/persistence/base.entity';
import { generateSecureRandomString } from 'src/core/utils/crypto.helper';
import { TaskBundleEntity } from 'src/tasks/entities/task-bundle.entity';
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
export class DomainJoinCredentials {
  @Property()
  username: string;

  @Property()
  password: string;
}

@Embeddable()
export class EntraJoinCredentials {

}

@Entity()
export class CustomerEntity extends CoreBaseEntity {
  @Property()
  name: string;

  @Property()
  shortCode: string;

  @Property({nullable: true})
  entraTenantId: string;

  @Property()
  zohoId: number;

  @Property()
  rmmId: number;

  @Property()
  itGlueId: number;

  @Property({ nullable: true })
  teamviewerId: string;

  @Property({ nullable: true })
  pulsewayDownloadUrl: string;

  @Property({ nullable: true })
  bitdefenderDownloadUrl: string;

  @Property({ nullable: true })
  pulsewayAssignmentId: string;

  @Property({ nullable: true })
  adDomain: string;

  @OneToMany(() => DeviceEntity, device => device.customer)
  devices = new Collection<DeviceEntity>(this);

  @OneToMany(() => VpnProfile, profile => profile.customer)
  vpnProfiles = new Collection<VpnProfile>(this);

  @ManyToMany(() => TasksEntity, task => task.customers, { owner: true })
  tasks = new Collection<TasksEntity>(this);

  @ManyToMany(() => TaskBundleEntity, taskBundle => taskBundle.customers, { owner: true })
  taskBundles = new Collection<TaskBundleEntity>(this);

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

  @Embedded(() => DomainJoinCredentials, { nullable: true })
  deviceEnrollmentCredentials?: DomainJoinCredentials;
}
