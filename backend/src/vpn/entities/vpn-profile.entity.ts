import { CoreBaseEntity } from 'src/core/persistence/base.entity';

import { Embeddable, Embedded, Entity, Enum, ManyToOne, Property } from '@mikro-orm/core';

import { CustomerEntity } from '../../customers/entities/customer.entity';

export enum VpnType {
  CISCO_ANYCONNECT = 'anyconnect',
  OPENCONNECT = 'openconnect',
  FORTINET = 'fortinet',
  WIREGUARD = 'wireguard',
  LOCAL = 'local',
  GP = 'gp',
}

@Embeddable()
export class wireGuardConfig {
  @Property()
  privateKey: string;

  @Property()
  publicKey: string;

  @Property()
  endpoint: string;

  @Property()
  allowedIPs: string[];

  @Property()
  persistentKeepalive: number;
}

@Embeddable()
export class OpenConnectConfig {
  @Property()
  username: string;

  @Property()
  password: string;

  @Property()
  authGroup: string;
}

@Entity()
export class VpnProfile extends CoreBaseEntity {
  @Property()
  name: string;

  @Enum(() => VpnType)
  type: VpnType;

  @ManyToOne(() => CustomerEntity)
  customer: CustomerEntity;

  @Property()
  hostname: string;

  @Property()
  port: number;

  @Property()
  protocol: string;

  @Property()
  testIp: string;

  @Property()
  isDefault: boolean = false;

  @Embedded(() => wireGuardConfig, { nullable: true })
  wireGuardConfig?: wireGuardConfig;

  @Embedded(() => OpenConnectConfig, { nullable: true })
  openConnectConfig?: OpenConnectConfig;
}
