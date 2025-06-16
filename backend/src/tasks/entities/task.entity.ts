import { BadRequestMTIException } from 'src/core/errorhandling/exceptions/bad-request.mti-exception';
import { MTIErrorCodes } from 'src/core/errorhandling/exceptions/mti.error-codes.enum';
import { CoreBaseEntity } from 'src/core/persistence/base.entity';
import { CustomerEntity } from 'src/customers/entities/customer.entity';
import { LocalFileMetadataEntity } from 'src/fileManagement/local-file/local-file-metadata.entity';

import {
  BeforeCreate,
  BeforeUpdate,
  Cascade,
  Collection,
  Entity,
  ManyToMany,
  OneToOne,
  Property,
} from '@mikro-orm/core';

import { TaskBundleEntity } from './task-bundle.entity';
import { TaskOrderEntity } from './task-order.entity';

@Entity()
export class TasksEntity extends CoreBaseEntity {
  @Property()
  name: string;

  @Property({ nullable: true })
  description: string;

  @Property()
  global: boolean;

  @Property({ default: false })
  buildIn: boolean = false;

  @Property({ type: 'longtext', nullable: true })
  installScript: string;

  @ManyToMany(() => CustomerEntity, customer => customer.tasks)
  customers = new Collection<CustomerEntity>(this);

  @ManyToMany({
    entity: () => TaskBundleEntity,
    pivotEntity: () => TaskOrderEntity,
    mappedBy: bundle => bundle.taskList,
    cascade: [Cascade.REMOVE],
    eager: false,
  })
  taskBundles = new Collection<TaskBundleEntity>(this);

  @OneToOne(() => LocalFileMetadataEntity, {
    nullable: true,
    owner: true,
    cascade: [Cascade.REMOVE],
  })
  contentFile?: LocalFileMetadataEntity;

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
        MTIErrorCodes.GLOBAL_TASK_CANNOT_HAVE_CUSTOMERS,
        'A global task cannot have customers assigned.',
      );
    }
  }
}
