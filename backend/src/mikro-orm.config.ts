import { Options } from '@mikro-orm/core';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { Customer } from './customers/entities/customer.entity';
import { Device } from './devices/entities/device.entity';
import { Image } from './images/entities/image.entity';
import { Job } from './jobs/entities/job.entity';
import { VpnProfile } from './vpn/entities/vpn-profile.entity';
import { User } from './users/entities/user.entity';

const config: Options = {
  type: 'sqlite',
  dbName: 'data/db.sqlite',
  entities: [Customer, Device, Image, Job, VpnProfile, User],
  entitiesTs: ['src/**/*.entity.ts'],
  debug: true,
  highlighter: new SqlHighlighter(),
  metadataProvider: TsMorphMetadataProvider,
  migrations: {
    path: 'src/database/migrations',
    pattern: /^[\w-]+\d+\.ts$/,
  },
  seeder: {
    path: 'src/database/seeders',
    defaultSeeder: 'DatabaseSeeder',
    glob: '!(*.d).{js,ts}',
  },
};

export default config;