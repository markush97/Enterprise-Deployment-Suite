import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthConfigService } from './auth.config.service';
import { EntraIdConfigService } from './strategies/entraID/entraId.config.service';
import { EntraIdStrategy } from './strategies/entraID/entraId.strategy';
import { PassportModule } from '@nestjs/passport';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AccountEntity } from './entities/account.entity';
import { EntraIdController } from './strategies/entraID/entraId.controller';
import { EntraIdAuthGuard } from './strategies/entraID/entraId.guard';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt/jwt.strategy';
import { JwtAuthGuard } from './strategies/jwt/jwt-auth.guard';
import { AuthJwtService } from './strategies/jwt/jwt.service';
import { JwtModule } from '@nestjs/jwt';
import { RefreshTokenModule } from './strategies/refreshtoken/refreshtoken.module';

@Module({
    imports: [MikroOrmModule.forFeature([AccountEntity]), JwtModule.registerAsync({
        useClass: AuthConfigService,
    }), RefreshTokenModule],
    controllers: [EntraIdController, AuthController],
    providers: [AuthService, AuthConfigService, EntraIdConfigService, EntraIdStrategy, EntraIdAuthGuard, JwtStrategy, JwtAuthGuard, AuthJwtService],
})
export class AuthModule { };
