import { MTIErrorCodes } from 'src/core/errorhandling/exceptions/mti.error-codes.enum';
import { NotFoundMTIException } from 'src/core/errorhandling/exceptions/not-found.mti-exception';
import { UnauthorizedMTIException } from 'src/core/errorhandling/exceptions/unauthorized.mti-exception';

import { Injectable, Logger } from '@nestjs/common';

import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';

import { LoginResultDto } from './dto/login.result.dto';
import { AccountEntity, UserRole } from './entities/account.entity';
import { EntraIdTokenPayload } from './strategies/entraID/interface/emtra-token.interface';
import { AuthJwtService } from './strategies/jwt/jwt.service';
import { RefreshTokenService } from './strategies/refreshtoken/refreshtoken.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepository: EntityRepository<AccountEntity>,
    private readonly em: EntityManager,
    private readonly jwtService: AuthJwtService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async loginEntraUser(userInfo: EntraIdTokenPayload): Promise<LoginResultDto> {
    let account = await this.accountRepository.findOne({ entraIdUserId: userInfo.oid });

    if (!account) {
      this.logger.debug(`Account ${userInfo.upn} does not exist yet, creating it...`);
      account = this.accountRepository.create({
        entraIdUserId: userInfo.oid,
        email: userInfo.upn,
        name: userInfo.name,
        role: UserRole.ADMINISTRATOR,
      });
    }

    account.lastLogin = new Date();
    await this.em.persistAndFlush(account);

    return this.jwtService.signUser(account);
  }

  async login(accountOrId: string | AccountEntity): Promise<LoginResultDto> {
    this.logger.debug(`Logging in account with id ${accountOrId}`);
    let account: AccountEntity;

    if (typeof accountOrId === 'string') {
      account = await this.accountRepository.findOneOrFail(accountOrId);
    } else {
      account = accountOrId;
    }

    account.lastLogin = new Date();
    await this.em.persistAndFlush(account);

    return this.jwtService.signUser(account);
  }

  async findByEntraIdUserId(entraIdUserId: string): Promise<AccountEntity | null> {
    this.logger.debug(`Fetching user by their entraId UserAccountId`);

    return this.accountRepository.findOne({ entraIdUserId });
  }

  async findOne(accountId: string): Promise<AccountEntity | null> {
    this.logger.debug(`Fetching user by their id ${accountId}`);

    return this.accountRepository.findOne({ id: accountId });
  }

    async findOneOrFail(accountId: string): Promise<AccountEntity | null> {
    this.logger.debug(`Fetching user by their id ${accountId}`);

    return this.accountRepository.findOneOrFail({ id: accountId });
  }

  async getAccounts(): Promise<AccountEntity[]> {
    return this.accountRepository.findAll();
  }

  public async refreshAccessToken(refreshToken?: string): Promise<LoginResultDto> {
    if (!refreshToken) {
      throw new NotFoundMTIException(MTIErrorCodes.REFRESHTOKEN_INVALID, 'Refreshtoken invalid');
    }

    const account = await this.refreshTokenService.getAccountByToken(refreshToken);
    return this.login(account);
  }

  async getOwnAccount(accountId: string): Promise<AccountEntity> {
    this.logger.debug(`Getting own Account Information for user ${accountId}`);
    return this.accountRepository.findOneOrFail(accountId);
  }
}
