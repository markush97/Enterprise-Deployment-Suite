import { Entity, Property, ManyToOne, Enum } from '@mikro-orm/core';
import { Customer } from '../../customers/entities/customer.entity';
import { CoreBaseEntity } from 'src/core/persistence/base.entity';
import { generateSecureRandomString } from 'src/core/utils/crypto.helper';

export enum DeviceType {
  PC = 'PC',
  NB = 'NB',
  TAB = 'TAB',
  MAC = 'MAC',
  SRV = 'SRV',
  DIV = 'DIV',
}

@Entity()
export class DeviceEntity extends CoreBaseEntity {
  @Property()
  name: string;

  @Enum(() => DeviceType)
  type: DeviceType;

  @ManyToOne(() => Customer)
  customer: Customer;

  @Property()
  createdBy: string;

  @Property()
  macAddress: string;

  @Property()
  bitlockerKey: string;

  @Property()
  osVersion: string;

  @Property()
  imageName: string;

  @Property()
  deviceSecret: string = generateSecureRandomString(32);
}
