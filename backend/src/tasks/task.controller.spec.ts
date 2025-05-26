import { Test, TestingModule } from '@nestjs/testing';

import { TasksController } from './task.controller';
import { TasksService } from './task.service';

describe('TasksController', () => {
  let controller: TasksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([]),
            findOne: jest.fn().mockResolvedValue({ id: '1' }),
            create: jest.fn().mockResolvedValue({ id: '1' }),
            registerJob: jest.fn().mockResolvedValue({ jobId: '1', deviceToken: 'token' }),
            taskNotification: jest.fn().mockResolvedValue({}),
            clientNotification: jest.fn().mockResolvedValue({}),
            createDeviceForJobAutomatically: jest.fn().mockResolvedValue({}),
            assignJobToCustomer: jest.fn().mockResolvedValue({}),
            remove: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
