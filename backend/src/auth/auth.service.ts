import { Injectable, Logger } from '@nestjs/common';
import { AccountEntity, UserRole } from './entities/account.entity';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { LoginResultDto } from './dto/login.result.dto';
import { AuthJwtService } from './strategies/jwt/jwt.service';
import { EntraIdTokenPayload } from './strategies/entraID/interface/emtra-token.interface';
import { RefreshTokenService } from './strategies/refreshtoken/refreshtoken.service';
import { REFRESH_TOKEN_COOKIE_NAME, RefreshTokenEntity } from './strategies/refreshtoken/refresh-token.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService')

  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepository: EntityRepository<AccountEntity>,
    private readonly em: EntityManager,
    private readonly jwtService: AuthJwtService,
    private readonly refreshTokenService: RefreshTokenService
  ) { }

  async loginEntraUser(userInfo: EntraIdTokenPayload): Promise<LoginResultDto> {
    let account = await this.accountRepository.findOne({ entraIdUserId: userInfo.oid })

    if (!account) {
      this.logger.debug(`Account ${userInfo.upn} does not exist yet, creating it...`)
      account = this.accountRepository.create({ entraIdUserId: userInfo.oid, email: userInfo.upn, name: userInfo.name, role: UserRole.ADMINISTRATOR })
    }

    account.lastLogin = new Date();
    await this.em.persistAndFlush(account);

    return this.jwtService.signUser(account)
  }

  async login(accountId: string): Promise<LoginResultDto> {
    this.logger.debug(`Logging in account with id ${accountId}`);

    const account = await this.accountRepository.findOneOrFail(accountId);

    account.lastLogin = new Date();
    await this.em.persistAndFlush(account);

    return this.jwtService.signUser(account);
  }

  async findByEntraIdUserId(entraIdUserId: string): Promise<AccountEntity | null> {
    this.logger.debug(`Fetching user by their entraId UserAccountId`);

    return this.accountRepository.findOne({ entraIdUserId })
  }

  async findOneById(accountId: string): Promise<AccountEntity | null> {
    this.logger.debug(`Fetching user by their id ${accountId}`);

    return this.accountRepository.findOne({ id: accountId })
  }

  async getAccounts(): Promise<AccountEntity[]> {
    return this.accountRepository.findAll();
  }

  public async refreshAccessToken(refreshToken: string): Promise<LoginResultDto> {
    const account = await this.refreshTokenService.getAccountByToken(refreshToken);
    return this.login(account.id);
  }

  async getOwnAccount(accountId: string): Promise<AccountEntity> {
    this.logger.debug(`Getting own Account Information for user ${accountId}`)
    return this.accountRepository.findOne({ id: accountId })
  }
}
