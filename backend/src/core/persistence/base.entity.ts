import {
    BaseEntity,
    Entity,
    Index,
    PrimaryKey,
    Property,
} from '@mikro-orm/core';
import { generateSecureRandomUUID } from '../utils/crypto.helper';

@Entity({ abstract: true })
export abstract class CoreBaseEntity extends BaseEntity {
    @PrimaryKey({ type: 'uuid' })
    @Index()
    id: string = generateSecureRandomUUID();

    @Property({ type: 'timestamptz' })
    createdAt: Date = new Date();

    @Property({ onUpdate: () => new Date(), type: 'timestamptz' })
    updatedAt: Date = new Date();
}
