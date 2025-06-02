import { AuthConfigService } from 'src/auth/auth.config.service';

import { Module } from '@nestjs/common';

import { MikroOrmModule } from '@mikro-orm/nestjs';

import { RefreshTokenEntity } from './refresh-token.entity';
import { RefreshTokenService } from './refreshtoken.service';

@Module({
  imports: [MikroOrmModule.forFeature([RefreshTokenEntity])],
  controllers: [],
  providers: [RefreshTokenService, AuthConfigService],
  exports: [RefreshTokenService],
})
export class RefreshTokenModule {}
