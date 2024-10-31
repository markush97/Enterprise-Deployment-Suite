import { Entity, Property, ManyToOne, Enum } from '@mikro-orm/core';
import { BaseEntity } from '../../shared/base.entity';
import { Customer } from '../../customers/entities/customer.entity';

export enum VpnType {
  CISCO_ANYCONNECT = 'cisco-anyconnect',
  OPENCONNECT = 'openconnect',
  FORTINET = 'fortinet',
  WIREGUARD = 'wireguard',
  LOCAL = 'local',
}

@Entity()
export class VpnProfile extends BaseEntity {
  @Property()
  name: string;

  @Enum(() => VpnType)
  type: VpnType;

  @ManyToOne(() => Customer)
  customer: Customer;

  @Property()
  hostname: string;

  @Property()
  port: number;

  @Property({ nullable: true })
  username?: string;

  @Property({ nullable: true })
  encryptedPassword?: string;

  @Property()
  protocol: string;

  @Property()
  testIp: string;

  @Property()
  isDefault: boolean = false;

  @Property({ type: 'json', nullable: true })
  wireGuardConfig?: {
    privateKey: string;
    publicKey: string;
    endpoint: string;
    allowedIPs: string[];
    persistentKeepalive: number;
  };
}