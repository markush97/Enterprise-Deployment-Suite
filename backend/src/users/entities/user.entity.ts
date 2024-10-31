import { Entity, Property, Enum } from '@mikro-orm/core';
import { BaseEntity } from '../../shared/base.entity';

export enum UserRole {
  ADMINISTRATOR = 'administrator',
  SYSTEMENGINEER = 'systemengineer',
  READONLY = 'readonly',
}

@Entity()
export class User extends BaseEntity {
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