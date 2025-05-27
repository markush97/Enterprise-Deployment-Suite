import { Test, TestingModule } from '@nestjs/testing';

import { TaskController } from './task.controller';
import { TaskService } from './task.service';

describe('TasksController', () => {
  let controller: TaskController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: TaskService,
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

    controller = module.get<TaskController>(TaskController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
