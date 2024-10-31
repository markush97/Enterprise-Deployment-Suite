import { Entity, Property, Enum } from '@mikro-orm/core';
import { CoreBaseEntity } from 'src/core/persistence/base.entity';

export enum UserRole {
  ADMINISTRATOR = 'administrator',
  SYSTEMENGINEER = 'systemengineer',
  READONLY = 'readonly',
}

@Entity()
export class User extends CoreBaseEntity {
  @Property()
  email: string;

  @Property()
  name: string;

  @Enum(() => UserRole)
  role: UserRole;

  @Property()
  isEntraId: boolean;

  @Property({ nullable: true })
  lastLogin?: Date;
}