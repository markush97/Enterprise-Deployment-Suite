import { Test, TestingModule } from '@nestjs/testing';
import { JobsService } from './jobs.service';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { JobEntity } from './entities/job.entity';
import { DevicesService } from '../devices/devices.service';
import { CustomersService } from '../customers/customers.service';
import { ImagesService } from '../images/images.service';
import { EMailService } from '../core/email/email.service';
import { EntityManager } from '@mikro-orm/core';

describe('JobsService', () => {
  let service: JobsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        { provide: getRepositoryToken(JobEntity), useValue: { findAll: jest.fn(), findOne: jest.fn() } },
        { provide: DevicesService, useValue: {} },
        { provide: CustomersService, useValue: {} },
        { provide: ImagesService, useValue: {} },
        { provide: EMailService, useValue: {} },
        { provide: EntityManager, useValue: {} },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call findAll on jobRepository', async () => {
    const jobRepository = (service as any).jobRepository;
    jobRepository.findAll.mockResolvedValue([]);
    const result = await service.findAll();
    expect(result).toEqual([]);
    expect(jobRepository.findAll).toHaveBeenCalled();
  });

  it('should throw NotFoundException if job not found', async () => {
    const jobRepository = (service as any).jobRepository;
    jobRepository.findOne.mockResolvedValue(undefined);
    await expect(service.findOne('123')).rejects.toThrow('Job with ID 123 not found');
  });
});
