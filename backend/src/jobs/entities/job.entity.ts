import { CoreBaseEntity } from 'src/core/persistence/base.entity';

import {
  Cascade,
  Collection,
  Entity,
  Enum,
  ManyToOne,
  OneToMany,
  OneToOne,
  Property,
  StringType,
} from '@mikro-orm/core';

import { CustomerEntity } from '../../customers/entities/customer.entity';
import { DeviceEntity } from '../../devices/entities/device.entity';
import { ImageEntity } from '../../images/entities/image.entity';
import { JobConnectionsEntity } from './job-connections.entity';
import { TaskBundleEntity } from 'src/tasks/entities/task-bundle.entity';

export enum JobStatus {
  WAITING_FOR_INSTRUCTIONS = 'waiting_for_instructions',
  PREPARING = 'preparing',
  IMAGING = 'imaging',
  PXE_SELECTION = 'pxe_selection',
  INSTALLING = 'installing',
  VERIFYING = 'verifying',
  READY = 'ready',
  DONE = 'done',
}

@Entity()
export class JobEntity extends CoreBaseEntity {
  @ManyToOne(() => DeviceEntity, { nullable: true })
  device?: DeviceEntity;

  @Property({ type: StringType, nullable: true })
  deviceSerialNumber: string;

  @ManyToOne(() => CustomerEntity, { nullable: true })
  customer?: CustomerEntity;

  @ManyToOne(() => ImageEntity, { nullable: true })
  image: ImageEntity;

  @Enum(() => JobStatus)
  status: JobStatus = JobStatus.PREPARING;

  @Property({type: 'timestamptz' })
  lastConnection: Date = new Date();

  @OneToOne(() => TaskBundleEntity, { nullable: true, cascade: [Cascade.ALL] })
  taskBundle?: TaskBundleEntity;
  

  @OneToMany(() => JobConnectionsEntity, connection => connection.job, {
    cascade: [Cascade.ALL],
    orphanRemoval: true,
  })
  connections: Collection<JobConnectionsEntity> = new Collection<JobConnectionsEntity>(this);

  @Property({ nullable: true })
  completedAt?: Date;
}
