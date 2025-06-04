import { DevicesService } from 'src/devices/devices.service';

import { Test, TestingModule } from '@nestjs/testing';

import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';

describe('JobsController', () => {
  let controller: JobsController;
  let jobsService: JobsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobsController],
      providers: [
        {
          provide: JobsService,
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
        {
          provide: DevicesService,
          useValue: {
            findOneByToken: jest.fn().mockResolvedValue({ id: '1' }),
          },
        },
      ],
    }).compile();

    controller = module.get<JobsController>(JobsController);
    jobsService = module.get<JobsService>(JobsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get all jobs', async () => {
    expect(await controller.findAll()).toEqual([]);
    expect(jobsService.findAll).toHaveBeenCalled();
  });

  it('should get a job by id', async () => {
    expect(await controller.findOne('1')).toEqual({ id: '1' });
    expect(jobsService.findOneOrFail).toHaveBeenCalledWith('1');
  });
});
