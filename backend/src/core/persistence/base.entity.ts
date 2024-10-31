import {
    Embeddable,
    Embedded,
    Entity,
    Index,
    PrimaryKey,
    Property,
} from '@mikro-orm/core';
import { generateSecureRandomUUID } from '../utils/crypto.helper';
import { UUID } from 'crypto';

@Embeddable()
export class TimeStampColumns {
    @Property({ type: 'timestamptz' })
    createdAt: Date = new Date();

    @Property({ onUpdate: () => new Date(), type: 'timestamptz' })
    updatedAt: Date = new Date();
}

@Entity({ abstract: true })
export abstract class CoreBaseEntity {
    @PrimaryKey({ type: 'uuid' })
    @Index()
    id: UUID = generateSecureRandomUUID();

    @Embedded(() => TimeStampColumns, {})
    timestamps: TimeStampColumns = new TimeStampColumns();
}
