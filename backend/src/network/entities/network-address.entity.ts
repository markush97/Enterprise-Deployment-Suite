import { Embeddable, ManyToOne, Property } from '@mikro-orm/core';

import { NetworkInterfaceEntity } from './network-interface.entity';

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
