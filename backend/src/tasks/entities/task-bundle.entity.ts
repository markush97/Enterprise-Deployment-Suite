import { BadRequestMTIException } from 'src/core/errorhandling/exceptions/bad-request.mti-exception';
import { MTIErrorCodes } from 'src/core/errorhandling/exceptions/mti.error-codes.enum';
import { CoreBaseEntity } from 'src/core/persistence/base.entity';
import { CustomerEntity } from 'src/customers/entities/customer.entity';

import {
  BeforeCreate,
  BeforeUpdate,
  Collection,
  Entity,
  ManyToMany,
  Property,
} from '@mikro-orm/core';

import { TaskOrderEntity } from './task-order.entity';
import { TasksEntity } from './task.entity';

@Entity()
export class TaskBundleEntity extends CoreBaseEntity {
  @Property()
  name: string;

  @Property({ nullable: true })
  description: string;

  @Property()
  global: boolean;

  @ManyToMany(() => CustomerEntity, customer => customer.taskBundles)
  customers = new Collection<CustomerEntity>(this);

  @ManyToMany({
    entity: () => TasksEntity,
    pivotEntity: () => TaskOrderEntity,
    fixedOrder: true,
    fixedOrderColumn: 'order',
  })
  taskList = new Collection<TasksEntity>(this);

  @BeforeCreate()
  @BeforeUpdate()
  checkGlobalNoCustomers() {
    if (
      this.global &&
      this.customers &&
      this.customers.isInitialized() &&
      this.customers.count() > 0
    ) {
      throw new BadRequestMTIException(
        MTIErrorCodes.GLOBAL_TASKBUNDLE_CANNOT_HAVE_CUSTOMERS,
        'A global task bundle cannot have customers assigned.',
      );
    }
  }
}
