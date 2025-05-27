import { CoreBaseEntity } from 'src/core/persistence/base.entity';
import { CustomerEntity } from 'src/customers/entities/customer.entity';
import { LocalFileMetadataEntity } from 'src/fileManagement/local-file/local-file-metadata.entity';

import { Collection, Entity, ManyToMany, OneToOne, Property } from '@mikro-orm/core';

@Entity()
export class TasksEntity extends CoreBaseEntity {
  @Property()
  name: string;

  @Property({ nullable: true })
  description: string;

  @Property()
  global: boolean;

  @Property({ type: 'longtext', nullable: true })
  installScript: string;

  @ManyToMany(() => CustomerEntity, customer => customer.tasks)
  customers = new Collection<TasksEntity>(this);

  @OneToOne(() => LocalFileMetadataEntity, { nullable: true })
  contentFile?: LocalFileMetadataEntity;
}
