import { Entity, Property, ManyToOne, Enum } from '@mikro-orm/core';
import { Customer } from '../../customers/entities/customer.entity';
import { CoreBaseEntity } from 'src/core/persistence/base.entity';
import { generateSecureRandomString } from 'src/core/utils/crypto.helper';

export enum DeviceType {
  PC = 'PC',
  NOTEBOOK = 'NB',
  TABLET = 'TAB',
  MAC = 'MAC',
  SERVER = 'SRV',
  OTHER = 'DIV',
}

@Entity()
export class DeviceEntity extends CoreBaseEntity {
  @Property()
  name: string;

  @Enum(() => DeviceType)
  type: DeviceType;

  @ManyToOne(() => Customer)
  customer: Customer;

  @Property({ nullable: true })
  createdBy: string;

  @Property({ nullable: true })
  bitlockerKey: string;

  @Property({ nullable: true })
  osVersion: string;

  @Property({ nullable: true })
  imageName: string;

  @Property({ hidden: true })
  deviceSecret: string = generateSecureRandomString(32);

  @Property()
  serialNumber: string;

  @Property()
  language: string = 'de-DE';

  @Property()
  locale: string = 'de-AT';

  @Property({ nullable: true })
  inputLocaleWin: string = '0c07:00000407'

  @Property({ nullable: true })
  itGlueId: string;

  @Property({ nullable: true })
  pulsewayId: string;

  @Property({ nullable: true })
  assetTag?: string;
}
