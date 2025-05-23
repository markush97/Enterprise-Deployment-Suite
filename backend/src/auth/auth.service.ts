import { Injectable, Logger } from '@nestjs/common';
import { AccountEntity, UserRole } from './entities/account.entity';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { LoginResultDto } from './dto/login.result.dto';
import { AuthJwtService } from './strategies/jwt/jwt.service';
import { EntraIdTokenPayload } from './strategies/entraID/interface/emtra-token.interface';
import { EntraIdAuthGuard } from './strategies/entraID/entraId.guard';


@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService')

  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepository: EntityRepository<AccountEntity>,
    private readonly em: EntityManager,
    private readonly jwtService: AuthJwtService
  ) { }

  async loginEntraUser(userInfo: EntraIdTokenPayload): Promise<LoginResultDto> {
    let account = await this.accountRepository.findOne({ entraIdUserId: userInfo.oid })

    if (!account) {
      this.logger.debug(`Account ${userInfo.upn} does not exist yet, creating it...`)
      account = this.accountRepository.create({ entraIdUserId: userInfo.oid, email: userInfo.upn, name: userInfo.name, role: UserRole.ADMINISTRATOR })
      await this.em.persistAndFlush(account);
    }

    return this.jwtService.signUser(account)
  }

  async findByEntraIdUserId(entraIdUserId: string): Promise<AccountEntity | null> {
    this.logger.debug(`Fetching user by their entraId UserAccountId`);

    return this.accountRepository.findOne({ entraIdUserId })
  }

  async findOneById(accountId: string): Promise<AccountEntity | null> {
    this.logger.debug(`Fetching user by their id ${accountId}`);

    return this.accountRepository.findOne({ id: accountId })
  }

}
