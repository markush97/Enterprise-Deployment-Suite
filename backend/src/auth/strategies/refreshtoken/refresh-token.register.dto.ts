export class CreateRefreshTokenDto {
  userAgent?: string;

  ipAddress!: string;

  accountId!: string;

  // This is a trick to allow setting a typeorm relation just by using the id
  account?: { id: string };

  token?: string;
}
