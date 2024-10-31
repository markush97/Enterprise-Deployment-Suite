import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    MikroOrmModuleOptions,
    MikroOrmOptionsFactory,
} from '@mikro-orm/nestjs';
import { Connection, IDatabaseDriver, LoadStrategy } from '@mikro-orm/core';
import { resolve } from 'path';
import { CoreBaseRepository } from './base.repository';
import { DEFAULT_DB_SETTINGS } from './persistence.default-settings';
import { NotFoundMTIException } from '../errorhandling/exceptions/not-found.mti-exception';
import { MTIErrorCodes } from '../errorhandling/exceptions/mti.error-codes.enum';
import { Migrator } from '@mikro-orm/migrations';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { SqliteDriver } from '@mikro-orm/sqlite';
import { MySqlDriver } from '@mikro-orm/mysql';
import { MsSqlDriver } from '@mikro-orm/mssql';

/**
 * ConfigService managing every persistence-related configuration
 */
@Injectable()
export class PersistenceConfigService implements MikroOrmOptionsFactory {
    private readonly logger = new Logger('Mikroorm-Database');

    constructor(private readonly config: ConfigService) {}

    /**
     * Loads and parses the configuration for the mikroOrmConnection from the Nest-Config service
     */
    createMikroOrmOptions(): MikroOrmModuleOptions<
        IDatabaseDriver<Connection>
    > {
        return {
            ...this.createSQLConfig(this.config.get('DB_TYPE')),
            autoLoadEntities: true,
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci',
            debug:
                this.config.get('DB_DEBUG', DEFAULT_DB_SETTINGS.debug) ===
                'true',
            loadStrategy: LoadStrategy.JOINED,
            logger: console.log,
            entityRepository: CoreBaseRepository,
            findOneOrFailHandler: (entityName: string) =>
                new NotFoundMTIException(
                    MTIErrorCodes.ENTITY_NOT_FOUND,
                    `${entityName} not found!`,
                ),
            extensions: [Migrator],
            migrations: {
                tableName: 'mikro_orm_migrations',
                path: resolve(__dirname, 'migrations'),
                glob: '!(*.d).{js,ts}',
                transactional: true,
                allOrNothing: true,
                emit: 'ts',
            },
            discovery: {
                disableDynamicFileAccess: true,
            },
        };
    }
    private createSQLConfig(type: 'Mariadb' | 'MySQL' | 'MSSQL' | 'PostgreSQL' | 'SQLite' = 'SQLite') {
        switch (type) {
            case 'Mariadb':
            case 'MySQL':
                return this.createMySQLConfig();
            case 'MSSQL':
                return this.createMSSQLConfig();
            case 'PostgreSQL':
                return this.createPostgresqlConfig();
            case 'SQLite':
                return this.createSQLiteConfig();
        }
    }

    private createSQLiteConfig() {
        return {
            driver: SqliteDriver,
            dbName: this.config.get<string>('DB_FILE', DEFAULT_DB_SETTINGS.dbFile)
        }
    }
    private createPostgresqlConfig() {
        return {
            driver: PostgreSqlDriver,
            ...this.createGenericSQLConfig()
        }
    }
    private createMySQLConfig() {
        return {
            driver: MySqlDriver,
            ...this.createGenericSQLConfig()
        }
    }
    private createMSSQLConfig() {
        return {
            driver: MsSqlDriver,
            ...this.createGenericSQLConfig()
        }
    }
    private createGenericSQLConfig() {
        return {
            driver: PostgreSqlDriver,
            host: this.config.get<string>('DB_HOST', DEFAULT_DB_SETTINGS.host),
            port: this.config.get<number>('DB_PORT', DEFAULT_DB_SETTINGS.port),
            user: this.config.get<string>('DB_USER', DEFAULT_DB_SETTINGS.user),
            password: this.config.get<string>(
                'DB_PASSWORD',
                DEFAULT_DB_SETTINGS.password,
            ),
            dbName: this.config.get<string>(
                'DB_DATABASE',
                DEFAULT_DB_SETTINGS.database,
            ),
        }
    }
}
