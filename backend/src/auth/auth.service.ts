import { Injectable, Logger } from '@nestjs/common';
import { AccountEntity } from './entities/account.entity';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';


@Injectable()
export class AuthService {

  private readonly logger = new Logger('AuthService')

  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepository: EntityRepository<AccountEntity>,
    private readonly em: EntityManager
  ) { }

  async findByEntraIdUserId(entraIdUserId: string): Promise<AccountEntity | null> {
    this.logger.debug(`Fetching user by their entraId UserAccountId`);

    return this.accountRepository.findOne({ entraIdUserId })
  }

  async findOneById(accountId: string): Promise<AccountEntity | null> {
    this.logger.debug(`Fetching user by their id ${accountId}`);

    return this.accountRepository.findOne({ id: accountId })
  }

}
