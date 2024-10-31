import { Entity, Property } from '@mikro-orm/core';
import { CoreBaseEntity } from 'src/core/persistence/base.entity';

@Entity()
export class Image extends CoreBaseEntity {
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