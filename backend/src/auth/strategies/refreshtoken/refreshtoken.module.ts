import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AccountEntity } from 'src/auth/entities/account.entity';
import { RefreshTokenService } from './refreshtoken.service';
import { RefreshTokenEntity } from './refresh-token.entity';

@Module({
    imports: [MikroOrmModule.forFeature([RefreshTokenEntity])],
    controllers: [],
    providers: [RefreshTokenService],
    exports: [RefreshTokenService],
})
export class RefreshTokenModule { }
