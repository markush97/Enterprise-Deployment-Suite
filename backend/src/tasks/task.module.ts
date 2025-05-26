import { Module } from '@nestjs/common';

import { MikroOrmModule } from '@mikro-orm/nestjs';

import { TasksEntity } from './entities/task.entity';
import { TasksController } from './task.controller';
import { TasksService } from './task.service';

@Module({
  imports: [MikroOrmModule.forFeature([TasksEntity])],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TaskModule {}
