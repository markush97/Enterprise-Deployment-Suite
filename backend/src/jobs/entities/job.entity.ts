import { Entity, Property, ManyToOne, Enum, StringType, OneToMany, Collection, Cascade } from '@mikro-orm/core';
import { CustomerEntity } from '../../customers/entities/customer.entity';
import { DeviceEntity } from '../../devices/entities/device.entity';
import { ImageEntity } from '../../images/entities/image.entity';
import { CoreBaseEntity } from 'src/core/persistence/base.entity';
import { JobConnectionsEntity } from './job-connections.entity';

export enum JobStatus {
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

  @OneToMany(() => JobConnectionsEntity, (connection) => connection.job, { cascade: [Cascade.ALL], orphanRemoval: true })
  connections: Collection<JobConnectionsEntity> = new Collection<JobConnectionsEntity>(this);

  @Property({ nullable: true })
  completedAt?: Date;
}
