import { Test, TestingModule } from '@nestjs/testing';

import { EntityManager } from '@mikro-orm/core';
import { getRepositoryToken } from '@mikro-orm/nestjs';

import { TasksEntity } from './entities/task.entity';
import { TasksService } from './task.service';

describe('JobsService', () => {
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(TasksEntity),
          useValue: { findAll: jest.fn(), findOne: jest.fn() },
        },
        { provide: EntityManager, useValue: {} },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
