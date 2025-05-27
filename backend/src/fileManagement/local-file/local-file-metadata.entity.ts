import { CoreBaseEntity } from 'src/core/persistence/base.entity';

import { Entity, Property } from '@mikro-orm/core';

@Entity()
export class LocalFileMetadataEntity extends CoreBaseEntity {
  @Property()
  filename: string;

  @Property()
  originalFilename: string;

  @Property()
  path: string;

  @Property()
  mimetype: string;
}
