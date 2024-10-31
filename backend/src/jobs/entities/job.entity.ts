import { Entity, Property, ManyToOne, Enum } from '@mikro-orm/core';
import { Customer } from '../../customers/entities/customer.entity';
import { Device } from '../../devices/entities/device.entity';
import { Image } from '../../images/entities/image.entity';
import { CoreBaseEntity } from 'src/core/persistence/base.entity';

export enum JobStatus {
  PREPARING = 'preparing',
  IMAGING = 'imaging',
  INSTALLING = 'installing',
  VERIFYING = 'verifying',
  READY = 'ready',
  DONE = 'done',
}

@Entity()
export class Job extends CoreBaseEntity {
  @ManyToOne(() => Device)
  device: Device;

  @ManyToOne(() => Customer)
  customer: Customer;

  @ManyToOne(() => Image)
  image: Image;

  @Enum(() => JobStatus)
  status: JobStatus = JobStatus.PREPARING;

  @Property({ nullable: true })
  completedAt?: Date;
}