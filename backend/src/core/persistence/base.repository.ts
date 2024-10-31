import { EntityRepository } from '@mikro-orm/core';
import { CoreBaseEntity } from './base.entity';


export class CoreBaseRepository<
    EntityType extends CoreBaseEntity,
> extends EntityRepository<EntityType> {
  
}
