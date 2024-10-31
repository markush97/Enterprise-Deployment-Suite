import { Module, Global, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MikroOrmMiddleware, MikroOrmModule } from '@mikro-orm/nestjs';
import { PersistenceConfigService } from './core-persistence.config.service';
import { MikroORM } from '@mikro-orm/core';

/**
 * Module setting up everything needed to work with persistent databases
 */
@Global()
@Module({
    imports: [
        MikroOrmModule.forRootAsync({
            useClass: PersistenceConfigService,
        }),
    ],
    controllers: [],
    providers: [],
    exports: [],
})
export class CorePersistenceModule implements NestModule {
    constructor(private readonly orm: MikroORM) {}
    // for some reason the auth middlewares in profile and article modules are fired before the request context one,
    // so they would fail to access contextual EM. by registering the middleware directly in AppModule, we can get
    // around this issue
    async configure(consumer: MiddlewareConsumer) {
        const migrator = this.orm.getMigrator();
        await migrator.up();

        consumer.apply(MikroOrmMiddleware).forRoutes('*');
    }
}
