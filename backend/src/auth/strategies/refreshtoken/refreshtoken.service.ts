import { CookieOptions } from 'express';
import { AccountEntity } from 'src/auth/entities/account.entity';
import { MTIErrorCodes } from 'src/core/errorhandling/exceptions/mti.error-codes.enum';
import { UnauthorizedMTIException } from 'src/core/errorhandling/exceptions/unauthorized.mti-exception';
import { generateSecureRandomString } from 'src/core/utils/crypto.helper';

import { Injectable, Logger } from '@nestjs/common';

import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';

import { RefreshTokenEntity } from './refresh-token.entity';
import { CreateRefreshTokenDto } from './refresh-token.register.dto';

const TOKEN_LENGTH = 32;
const TOKEN_LIFESPAN = 10000000;

const isValid = (token: RefreshTokenEntity) =>
  new Date(token?.createdAt).getTime() + TOKEN_LIFESPAN > Date.now();

@Injectable()
export class RefreshTokenService {
  private readonly logger = new Logger('RefreshTokenService');

  constructor(
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepository: EntityRepository<RefreshTokenEntity>,
    private readonly em: EntityManager,
  ) {}

  async createRefreshToken(refreshToken: CreateRefreshTokenDto): Promise<RefreshTokenEntity> {
    refreshToken.account = { id: refreshToken.accountId };
    refreshToken.token = generateSecureRandomString(TOKEN_LENGTH);
    const token = this.refreshTokenRepository.create(refreshToken);
    await this.em.persistAndFlush(token);
    return token;
  }

  async validateRefreshToken(refreshToken: string): Promise<AccountEntity> {
    this.logger.debug('Retrieving RefreshToken by token');
    const storedToken = await this.refreshTokenRepository.findOne({ token: refreshToken });

    if (!storedToken || !isValid(storedToken)) {
      throw new UnauthorizedMTIException(
        MTIErrorCodes.REFRESHTOKEN_INVALID,
        'Refreshtoken invalid or expired',
      );
    }

    this.logger.log(`Found refreshtoken associated with account: ${storedToken.account.id}`);
    storedToken.lastUsedAt = new Date();
    await this.em.persistAndFlush(storedToken);

    return storedToken.account;
  }

  async getAccountByToken(refreshToken: string): Promise<AccountEntity> {
    return await this.validateRefreshToken(refreshToken);
  }

  async getRefreshTokens(accountId: string): Promise<RefreshTokenEntity[]> {
    return this.refreshTokenRepository.find({ account: { id: accountId } });
  }

  async createRefreshTokenCookie(
    refreshTokenInfo: CreateRefreshTokenDto,
  ): Promise<[token: string, options: CookieOptions]> {
    const now = new Date();
    return [
      (await this.createRefreshToken(refreshTokenInfo)).token,
      {
        httpOnly: true,
        secure: true,
        // expires 3 months from now
        expires: new Date(now.setMonth(now.getMonth() + 3)),
        path: '/',
        sameSite: 'strict',
      },
    ];
  }

  async rejectRefreshtokenById(accountId: string, refreshTokenId: string): Promise<void> {
    this.logger.debug(`Deleting token by id ${refreshTokenId}`);
    await this.refreshTokenRepository.nativeDelete({
      account: { id: accountId },
      id: refreshTokenId,
    });
  }

  async rejectAllRefreshtoken(accountId: string): Promise<void> {
    this.logger.debug('Deleting refresh Token');
    await this.refreshTokenRepository.nativeDelete({ account: { id: accountId } });
  }
}
