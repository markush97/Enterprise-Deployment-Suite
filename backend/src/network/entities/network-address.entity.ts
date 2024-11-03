import { Embeddable, Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { NetworkInterfaceEntity } from './network-interface.entity';
import { CoreBaseEntity } from 'src/core/persistence/base.entity';

@Embeddable()
export class NetworkAddressEntity {
  @Property()
  address!: string;

  @Property()
  netmask!: string;

  @Property()
  family!: string;

  @Property()
  internal!: boolean;

  @ManyToOne(() => NetworkInterfaceEntity)
  interface!: NetworkInterfaceEntity;
}