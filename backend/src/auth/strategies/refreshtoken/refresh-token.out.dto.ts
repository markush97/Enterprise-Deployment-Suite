import { AccountEntity } from 'src/auth/entities/account.entity';

export class RefreshTokenOutDto {
  createdAt: Date;
  updatedAt: Date;
  id: string;
  account: AccountEntity;
  lastUsedAt?: Date;
  userAgent?: string;
  ipAddress?: string;
  isCurrent?: boolean;
}
