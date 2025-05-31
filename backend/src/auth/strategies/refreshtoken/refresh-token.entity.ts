import { AccountEntity } from 'src/auth/entities/account.entity';
import { CoreBaseEntity } from 'src/core/persistence/base.entity';

import { Entity, ManyToOne, Property } from '@mikro-orm/core';

export const REFRESH_TOKEN_COOKIE_NAME = 'eds-refresh-token';

@Entity()
export class RefreshTokenEntity extends CoreBaseEntity {
  @Property({
    unique: true,
    hidden: true,
  })
  token: string;

  @Property({ nullable: true })
  lastUsedAt: Date;

  @Property({ type: 'json' })
  userAgent: string;

  @ManyToOne(() => AccountEntity)
  account: AccountEntity;

  @Property({ nullable: true })
  ipAddress: string;
}
