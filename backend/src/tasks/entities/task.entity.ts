import { CoreBaseEntity } from 'src/core/persistence/base.entity';
import { CustomerEntity } from 'src/customers/entities/customer.entity';

import { Collection, Entity, ManyToMany, Property } from '@mikro-orm/core';

@Entity()
export class TasksEntity extends CoreBaseEntity {
  @Property()
  name: string;

  @Property()
  description: string;

  @Property()
  global: boolean;

  @ManyToMany(() => CustomerEntity, customer => customer.tasks)
  customers = new Collection<TasksEntity>(this);
}
