import { Entity, Property, PrimaryKey, ManyToOne } from '@mikro-orm/core';
import { JobEntity } from './job.entity';
import { CoreBaseEntity } from 'src/core/persistence/base.entity';
import { TaskBundleEntity } from 'src/tasks/entities/task-bundle.entity';
import { TasksEntity } from 'src/tasks/entities/task.entity';
import { DeviceEntity } from 'src/devices/entities/device.entity';

@Entity()
export class JobLogEntity extends CoreBaseEntity {
  @ManyToOne(() => JobEntity)
  job!: JobEntity;

  @Property()
  timestamp!: Date;

  @Property()
  message!: string;

  @Property({ type: 'json', nullable: true })
  meta?: Record<string, any>;

  @ManyToOne({ nullable: true, entity: () => TasksEntity })
  task?: TasksEntity;

  @ManyToOne(() => DeviceEntity, {eager: false})
  device!: DeviceEntity;
}
