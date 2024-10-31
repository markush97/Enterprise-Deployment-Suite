import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from '../../shared/base.entity';

@Entity()
export class Image extends BaseEntity {
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