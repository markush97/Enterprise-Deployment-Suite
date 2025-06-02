import { CookieOptions } from 'express';
import { AuthConfigService } from 'src/auth/auth.config.service';
import { AccountEntity } from 'src/auth/entities/account.entity';
import { MTIErrorCodes } from 'src/core/errorhandling/exceptions/mti.error-codes.enum';
import { NotFoundMTIException } from 'src/core/errorhandling/exceptions/not-found.mti-exception';
import { generateSecureRandomString } from 'src/core/utils/crypto.helper';

import { Injectable, Logger } from '@nestjs/common';

import { EntityManager, EntityRepository, Loaded } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';

import { RefreshTokenEntity } from './refresh-token.entity';
import { RefreshTokenOutDto } from './refresh-token.out.dto';
import { CreateRefreshTokenDto } from './refresh-token.register.dto';

const TOKEN_LENGTH = 32;

@Injectable()
export class RefreshTokenService {
  private readonly logger = new Logger('RefreshTokenService');

  constructor(
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepository: EntityRepository<RefreshTokenEntity>,
    private readonly em: EntityManager,
    private readonly authConfig: AuthConfigService,
  ) {}

  async createRefreshToken(refreshToken: CreateRefreshTokenDto): Promise<RefreshTokenEntity> {
    refreshToken.account = { id: refreshToken.accountId };
    refreshToken.token = generateSecureRandomString(TOKEN_LENGTH);
    const token = this.refreshTokenRepository.create(refreshToken);
    await this.em.persistAndFlush(token);
    return token;
  }

  async getAccountByToken(refreshToken: string): Promise<AccountEntity> {
    this.logger.debug('Retrieving RefreshToken by token');
    const storedToken = await this.refreshTokenRepository.findOne(
      { token: refreshToken },
      { populate: ['account'] },
    );

    if (!storedToken || !this.checkTokenValidity(storedToken)) {
      throw new NotFoundMTIException(
        MTIErrorCodes.REFRESHTOKEN_INVALID,
        'Refreshtoken invalid or expired',
      );
    }

    this.logger.log(`Found refreshtoken associated with account: ${storedToken.account.id}`);
    storedToken.lastUsedAt = new Date();
    await this.em.persistAndFlush(storedToken);

    return storedToken.account;
  }

  async getRefreshTokens(accountId: string, currentToken?: string): Promise<RefreshTokenOutDto[]> {
    const refreshTokens = await this.refreshTokenRepository.find(
      { account: { id: accountId } },
      { fields: ['*'] },
    );
    return refreshTokens.map(token => {
      const { token: _token, ...rest } = token;
      return {
        ...rest,
        isCurrent: token.token === currentToken,
      };
    });
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
        expires: new Date(now.getTime() + this.authConfig.refreshTokenLifespan),
        path: '/',
        sameSite: 'strict',
      },
    ];
  }

  async rejectRefreshtokenByToken(token: string): Promise<void> {
    this.logger.debug(`Deleting token by token`);
    await this.refreshTokenRepository.nativeDelete({
      token: token,
    });
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

  checkTokenValidity(token: RefreshTokenEntity): boolean {
    return new Date(token?.createdAt).getTime() + this.authConfig.refreshTokenLifespan > Date.now();
  }
}
