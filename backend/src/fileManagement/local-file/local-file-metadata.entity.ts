import { join } from 'path';
import { CoreBaseEntity } from 'src/core/persistence/base.entity';

import { Entity, Property } from '@mikro-orm/core';

@Entity()
export class LocalFileMetadataEntity extends CoreBaseEntity {
  @Property()
  filename: string;

  @Property({ nullable: true })
  originalFilename?: string;

  @Property()
  path: string;

  @Property()
  mimetype: string;

  @Property({ persist: false })
  get fullPath() {
    return join(this.path, this.filename);
  }

  @Property()
  isFolder: boolean = false;
}
