import { Entity, ManyToOne, Property } from '@mikro-orm/core';

import { TaskBundleEntity } from './task-bundle.entity';
import { TasksEntity } from './task.entity';

@Entity()
export class TaskOrderEntity {
  @ManyToOne({ entity: () => TasksEntity, primary: true, deleteRule: 'cascade', })
  task: TasksEntity;

  @ManyToOne({ entity: () => TaskBundleEntity, primary: true, deleteRule: 'cascade', })
  bundle: TaskBundleEntity;

  @Property()
  order: number;
}
