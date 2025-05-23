import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';

import { MikroOrmModule } from '@mikro-orm/nestjs';

import { AuthConfigService } from './auth.config.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccountEntity } from './entities/account.entity';
import { EntraIdConfigService } from './strategies/entraID/entraId.config.service';
import { EntraIdController } from './strategies/entraID/entraId.controller';
import { EntraIdAuthGuard } from './strategies/entraID/entraId.guard';
import { EntraIdStrategy } from './strategies/entraID/entraId.strategy';
import { AppAuthGuard } from './strategies/jwt/app-auth.guard';
import { AuthJwtService } from './strategies/jwt/jwt.service';
import { JwtStrategy } from './strategies/jwt/jwt.strategy';
import { RefreshTokenModule } from './strategies/refreshtoken/refreshtoken.module';

@Global()
@Module({
  imports: [
    MikroOrmModule.forFeature([AccountEntity]),
    JwtModule.registerAsync({
      useClass: AuthConfigService,
    }),
    RefreshTokenModule,
  ],
  controllers: [EntraIdController, AuthController],
  providers: [
    AuthService,
    AuthConfigService,
    EntraIdConfigService,
    EntraIdStrategy,
    EntraIdAuthGuard,
    JwtStrategy,
    AuthJwtService,
    {
      provide: APP_GUARD,
      useClass: AppAuthGuard,
    },
  ],
})
export class AuthModule {}
