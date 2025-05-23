import { Entity, Property, Enum } from '@mikro-orm/core';
import { CoreBaseEntity } from 'src/core/persistence/base.entity';

export enum UserRole {
    ADMINISTRATOR = 'administrator',
    SYSTEMENGINEER = 'systemengineer',
    READONLY = 'readonly',
}

@Entity()
export class AccountEntity extends CoreBaseEntity {
    @Enum(() => UserRole)
    role: UserRole;

    @Property({ nullable: true })
    entraIdUserId: string

    @Property({ nullable: true })
    lastLogin?: Date;
}
