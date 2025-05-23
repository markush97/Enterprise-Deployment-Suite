import { AccountEntity } from 'src/auth/entities/account.entity';

export class RefreshTokenOutDto {
  timestamps!: { createdAt: string; updatedAt: string };
  id!: string;
  account!: AccountEntity;
  token!: string;
  lastUsedAt!: string;
  userAgent!: string;
  ipAddress!: string;
}
