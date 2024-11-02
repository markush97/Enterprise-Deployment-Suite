import { MikroORM } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { EntityManager } from '@mikro-orm/sqlite';

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
  }
}