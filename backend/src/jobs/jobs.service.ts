import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { JobEntity, JobStatus } from './entities/job.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { DevicesService } from '../devices/devices.service';
import { CustomersService } from '../customers/customers.service';
import { ImagesService } from '../images/images.service';
import { ClientInfoDto } from './dto/client-info.dto';
import { JobConnectionsEntity } from './entities/job-connections.entity';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(JobEntity)
    private readonly jobRepository: EntityRepository<JobEntity>,
    private readonly devicesService: DevicesService,
    private readonly customersService: CustomersService,
    private readonly imagesService: ImagesService,
    private readonly em: EntityManager
  ) {}

  async findAll(): Promise<JobEntity[]> {
    return this.jobRepository.findAll({
      populate: ['device', 'customer', 'image'],
      orderBy: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<JobEntity> {
    const job = await this.jobRepository.findOne(id, {
      populate: ['device', 'customer', 'image'],
    });
    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    return job;
  }

  async create(createJobDto: CreateJobDto): Promise<JobEntity> {
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

  async updateStatus(id: string, status: string): Promise<JobEntity> {
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

  async clientNotification(clientInfo: ClientInfoDto) {
    let job = await this.jobRepository.findOne({device: { macAddress: clientInfo.clientMac }, $not: {status: JobStatus.DONE}});

    if (job) {
      await this.updateStatus(job.id, JobStatus.CONNECTED);
    } else {
      job = this.jobRepository.create({status: JobStatus.CONNECTED})
    }

    job.connections.add(new JobConnectionsEntity(clientInfo));

    await this.em.persistAndFlush(job);
  }

}