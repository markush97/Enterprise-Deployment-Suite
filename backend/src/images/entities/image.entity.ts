import { CoreBaseEntity } from 'src/core/persistence/base.entity';

import { Entity, Property } from '@mikro-orm/core';

@Entity()
export class ImageEntity extends CoreBaseEntity {
  @Property()
  name: string;

  @Property()
  version: string;

  @Property()
  distribution: string;

  @Property()
  buildNumber: string;

  @Property()
  imagePath: string;

  @Property()
  size: number;
}
