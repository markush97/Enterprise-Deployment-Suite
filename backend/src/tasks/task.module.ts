import { FileManagementConfigService } from 'src/fileManagement/file-management.config.service';
import { FileManagementModule } from 'src/fileManagement/file-management.module';

import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';

import { MikroOrmModule } from '@mikro-orm/nestjs';

import { TasksEntity } from './entities/task.entity';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([TasksEntity]),
    MulterModule.registerAsync({ useClass: FileManagementConfigService }),
    FileManagementModule,
  ],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
