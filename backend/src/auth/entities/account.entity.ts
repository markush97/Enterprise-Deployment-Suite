import { CoreBaseEntity } from 'src/core/persistence/base.entity';

import { Entity, Enum, Property } from '@mikro-orm/core';

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
  entraIdUserId: string;

  @Property({ nullable: true })
  lastLogin?: Date;

  @Property()
  email: string;

  @Property()
  name: string;
}
