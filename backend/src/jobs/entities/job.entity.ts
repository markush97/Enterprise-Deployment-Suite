import { CoreBaseEntity } from 'src/core/persistence/base.entity';
import { TaskBundleEntity } from 'src/tasks/entities/task-bundle.entity';
import { generate } from "random-words";

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
import { AccountEntity } from 'src/auth/entities/account.entity';

export enum JobStatus {
  WAITING_FOR_INSTRUCTIONS = 'waiting_for_instructions',
  STARTING = 'starting',
  PREPARING = 'preparing',
  IMAGING = 'imaging',
  PXE_SELECTION = 'pxe_selection',
  INSTALLING = 'installing',
  VERIFYING = 'verifying',
  READY = 'ready',
  DONE = 'done',
  CANCELED = 'canceled',
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

  @ManyToOne(() => AccountEntity, { nullable: true })
  startedBy: AccountEntity;

  @Property({ type: 'timestamptz' })
  lastConnection: Date = new Date();

  @ManyToOne(() => TaskBundleEntity, { nullable: true, cascade: [Cascade.ALL] })
  taskBundle?: TaskBundleEntity;

  @OneToMany(() => JobConnectionsEntity, connection => connection.job, {
    cascade: [Cascade.ALL],
    orphanRemoval: true,
  })
  connections: Collection<JobConnectionsEntity> = new Collection<JobConnectionsEntity>(this);

  @Property({ nullable: true })
  completedAt?: Date;

  @Property({ nullable: true })
  name?: string = generateJobName();


}

const generateJobName = (): string => {
    // <YYMMDD>-<RandomEnglishWord>-<RandomEnglishWord>
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const y = now.getFullYear().toString().slice(-2);
    const m = pad(now.getMonth() + 1);
    const d = pad(now.getDate());
    // Use random-words package for two random words
    const words = generate({ wordsPerString: 2, exactly: 1, separator: '-' });
    return `${y}${m}${d}-${words}`;
  }