import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { JobEntity, JobStatus } from './entities/job.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { DevicesService } from '../devices/devices.service';
import { CustomersService } from '../customers/customers.service';
import { ImagesService } from '../images/images.service';
import { ClientInfoDto } from './dto/client-info.dto';
import { JobConnectionsEntity } from './entities/job-connections.entity';
import { ClientConfig } from 'dhcp';
import { DeviceConfigDto } from 'src/devices/dto/device-config.dto';
import { DeviceType } from 'src/devices/entities/device.entity';
import { BadRequestMTIException } from 'src/core/errorhandling/exceptions/bad-request.mti-exception';
import { MTIErrorCodes } from 'src/core/errorhandling/exceptions/mti.error-codes.enum';

@Injectable()
export class JobsService {
  private readonly logger = new Logger('JobsService')

  constructor(
    @InjectRepository(JobEntity)
    private readonly jobRepository: EntityRepository<JobEntity>,
    private readonly devicesService: DevicesService,
    private readonly customersService: CustomersService,
    private readonly imagesService: ImagesService,
    private readonly em: EntityManager
  ) { }

  async findAll(): Promise<JobEntity[]> {
    this.logger.debug('Fetching all jobs');
    return this.jobRepository.findAll({
      populate: ['device', 'customer', 'image'],
      orderBy: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<JobEntity> {
    this.logger.debug(`Searching for job with ID ${id}`);
    const job = await this.jobRepository.findOne(id, {
      populate: ['device', 'customer', 'image'],
    });
    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    return job;
  }

  async assignJobToCustomer(jobId: string, customerId: string): Promise<JobEntity> {
    this.logger.debug(`Assigning job with ID ${jobId} to customer with ID ${customerId}`);
    const job = await this.findOne(jobId);
    const customer = await this.customersService.findOne(customerId);
    job.customer = customer;
    await this.em.flush();
    return job;
  }

  async createDeviceForJobAutomatically(jobId: string, deviceType: DeviceType = DeviceType.PC): Promise<JobEntity> {
    this.logger.debug(`Creating device for job with ID ${jobId} and device type ${deviceType}`);
    const job = await this.findOne(jobId);

    if (job.device) {
      throw new BadRequestMTIException(MTIErrorCodes.AUTODEVICECREATION_DEVICE_EXISTS, 'Autoassign is only possible if the job has no device assigned');
    }

    if (!job.customer) {
      throw new BadRequestMTIException(MTIErrorCodes.AUTODEVICECREATION_NEEDS_CUSTOMER, 'Autoassign is only possible if the job has a customer assigned');
    }

    const newDevice = await this.devicesService.create({
      name: `${job.customer.shortCode}-${deviceType}${(await this.customersService.increaseDeviceNumber(job.customer.id, deviceType)).toString().padStart(3, '0')}`,
      type: deviceType,
      customerId: job.customer.id,
      macAddress: job.mac,
      createdBy: 'system',
    })

    job.device = newDevice;

    this.em.persist(newDevice);
    this.em.persist(job);

    await this.em.flush();
    return job;
  }

  async getJobIDByMac(mac: string): Promise<string> {
    this.logger.debug(`Searching for job with mac ${mac}`);

    const job = await this.jobRepository.findOneOrFail({ mac: mac, $not: { status: JobStatus.DONE } });
    return job.id;
  }

  async getJobConfigByMac(mac: string): Promise<DeviceConfigDto> {
    this.logger.debug(`Searching for job with mac ${mac}`);
    const job = await this.jobRepository.findOne({ mac: mac, $not: { status: JobStatus.DONE } });

    if (!job) {
      throw new NotFoundException(`Job with mac ${mac} not found`);
    }
    return {
      jobId: job.id,
      deviceId: job.device?.id,
      deviceName: job.device?.name,
      deviceMac: job.mac,
    }
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

  async clientNotification(clientInfo: ClientInfoDto): Promise<string> {
    this.logger.log(`Client ${clientInfo.clientIp} notified us about connection...`)
    let job = await this.jobRepository.findOne({ mac: clientInfo.clientMac, $not: { status: JobStatus.DONE } });

    if (job) {
      this.logger.debug(`Found job for client ${clientInfo.clientIp} with ID ${job.id}, updating status to "pxe-selection"`);
      await this.updateStatus(job.id, JobStatus.PXE_SELECTION);
    } else {
      this.logger.debug(`No job found for client ${clientInfo.clientIp}, creating new job...`);
      job = this.jobRepository.create({ status: JobStatus.PXE_SELECTION, mac: clientInfo.clientMac });
    }

    job.connections.add(new JobConnectionsEntity(clientInfo));
    await this.em.persistAndFlush(job);

    return `
echo "Server connection successfull!"
configfile grub/config/main.cfg
    `
  }
}
