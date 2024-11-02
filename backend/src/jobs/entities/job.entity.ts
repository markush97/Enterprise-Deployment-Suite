import { Entity, Property, ManyToOne, Enum } from '@mikro-orm/core';
import { Customer } from '../../customers/entities/customer.entity';
import { DeviceEntity } from '../../devices/entities/device.entity';
import { ImageEntity } from '../../images/entities/image.entity';
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
  @ManyToOne(() => DeviceEntity)
  device: DeviceEntity;

  @ManyToOne(() => Customer)
  customer: Customer;

  @ManyToOne(() => ImageEntity)
  image: ImageEntity;

  @Enum(() => JobStatus)
  status: JobStatus = JobStatus.PREPARING;

  @Property({ nullable: true })
  completedAt?: Date;
}