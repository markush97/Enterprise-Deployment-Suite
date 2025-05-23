import { AccountEntity } from 'src/auth/entities/account.entity';

import { Module } from '@nestjs/common';

import { MikroOrmModule } from '@mikro-orm/nestjs';

import { RefreshTokenEntity } from './refresh-token.entity';
import { RefreshTokenService } from './refreshtoken.service';

@Module({
  imports: [MikroOrmModule.forFeature([RefreshTokenEntity])],
  controllers: [],
  providers: [RefreshTokenService],
  exports: [RefreshTokenService],
})
export class RefreshTokenModule {}
