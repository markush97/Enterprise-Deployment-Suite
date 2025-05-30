import { CoreBaseEntity } from 'src/core/persistence/base.entity';

import { Entity, ManyToOne, Property } from '@mikro-orm/core';

import { ClientInfoDto } from '../dto/client-info.dto';
import { JobEntity } from './job.entity';

@Entity()
export class JobConnectionsEntity extends CoreBaseEntity {
  constructor(clientInfo: ClientInfoDto) {
    super();

    Object.assign(this, clientInfo);
  }

  @Property({ nullable: true })
  clientIp?: string;

  @Property({ nullable: true })
  clientMac?: string;

  @Property({ nullable: true })
  clientPlatform?: string;

  @ManyToOne(() => JobEntity)
  job: JobEntity;
}
