import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { Job, JobStatus } from './entities/job.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { DevicesService } from '../devices/devices.service';
import { CustomersService } from '../customers/customers.service';
import { ImagesService } from '../images/images.service';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: EntityRepository<Job>,
    private readonly devicesService: DevicesService,
    private readonly customersService: CustomersService,
    private readonly imagesService: ImagesService,
    private readonly em: EntityManager
  ) {}

  async findAll(): Promise<Job[]> {
    return this.jobRepository.findAll({
      populate: ['device', 'customer', 'image'],
      orderBy: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Job> {
    const job = await this.jobRepository.findOne(id, {
      populate: ['device', 'customer', 'image'],
    });
    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    return job;
  }

  async create(createJobDto: CreateJobDto): Promise<Job> {
    const device = await this.devicesService.findOne(createJobDto.deviceId);
    const customer = await this.customersService.findOne(createJobDto.customerId);
    const image = await this.imagesService.findOne(createJobDto.imageId);

    const job = this.jobRepository.create({
      device,
      customer,
      image,
      status: createJobDto.status || JobStatus.PREPARING,
    });

    await this.em.persistAndFlush(job);
    return job;
  }

  async updateStatus(id: string, status: string): Promise<Job> {
    const job = await this.findOne(id);
    job.status = status as JobStatus;
    
    if (status === JobStatus.DONE) {
      job.completedAt = new Date();
    }

    await this.em.flush();
    return job;
  }

  async remove(id: string): Promise<void> {
    const job = await this.findOne(id);
    await this.em.removeAndFlush(job);
  }
}