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

@Module({
    imports: [MikroOrmModule.forFeature([AccountEntity])],
    controllers: [EntraIdController],
    providers: [AuthService, AuthConfigService, EntraIdConfigService, EntraIdStrategy, EntraIdAuthGuard],
})
export class AuthModule { };
