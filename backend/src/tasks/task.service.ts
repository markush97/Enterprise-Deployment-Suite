import { Injectable, Logger } from '@nestjs/common';

import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';

import { TasksEntity } from './entities/task.entity';

@Injectable()
export class TasksService {
  private readonly logger = new Logger('TasksService');

  constructor(
    @InjectRepository(TasksEntity)
    private readonly taskRepository: EntityRepository<TasksEntity>,
    private readonly em: EntityManager,
  ) {}
}
