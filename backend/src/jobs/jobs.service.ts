import { EMailService } from 'src/core/email/email.service';
import { BadRequestMTIException } from 'src/core/errorhandling/exceptions/bad-request.mti-exception';
import { MTIErrorCodes } from 'src/core/errorhandling/exceptions/mti.error-codes.enum';
import { DeviceType } from 'src/devices/entities/device.entity';

import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';

import { CustomersService } from '../customers/customers.service';
import { DevicesService } from '../devices/devices.service';
import { ImagesService } from '../images/images.service';
import { ClientInfoDto } from './dto/client-info.dto';
import { CreateJobDto } from './dto/create-job.dto';
import { RegisterJobDto } from './dto/register-job.dto';
import { TaskInfoDto } from './dto/task-info.dto';
import { JobConnectionsEntity } from './entities/job-connections.entity';
import { JobEntity, JobStatus } from './entities/job.entity';
import { JobInstructionAction, JobInstructionsDto } from './dto/job-instructions.dto';

@Injectable()
export class JobsService {
  private readonly logger = new Logger('JobsService');

  constructor(
    @InjectRepository(JobEntity)
    private readonly jobRepository: EntityRepository<JobEntity>,
    private readonly devicesService: DevicesService,
    private readonly customersService: CustomersService,
    private readonly imagesService: ImagesService,
    private readonly mailService: EMailService,
    private readonly em: EntityManager,
  ) {}

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

  async getJobInstructions(id: string): Promise<JobInstructionsDto> {
    const job = await this.jobRepository.findOneOrFail(id);
    job.lastConnection = new Date();
    await this.em.persistAndFlush(job);

    return {
      action: JobInstructionAction.WAIT_FOR_INSTRUCTIONS,
    }
  }

  async assignJobToCustomer(jobId: string, customerId: string): Promise<JobEntity> {
    this.logger.debug(`Assigning job with ID ${jobId} to customer with ID ${customerId}`);
    const job = await this.findOne(jobId);
    const customer = await this.customersService.findOne(customerId);
    job.customer = customer;
    await this.em.flush();
    return job;
  }

  async createDeviceForJobAutomatically(
    jobId: string,
    deviceType: DeviceType = DeviceType.PC,
  ): Promise<JobEntity> {
    this.logger.debug(`Creating device for job with ID ${jobId} and device type ${deviceType}`);
    const job = await this.findOne(jobId);

    if (job.device) {
      throw new BadRequestMTIException(
        MTIErrorCodes.AUTODEVICECREATION_DEVICE_EXISTS,
        'Autoassign is only possible if the job has no device assigned',
      );
    }

    if (!job.customer) {
      throw new BadRequestMTIException(
        MTIErrorCodes.AUTODEVICECREATION_NEEDS_CUSTOMER,
        'Autoassign is only possible if the job has a customer assigned',
      );
    }

    const newDevice = await this.devicesService.create({
      name: `${job.customer.shortCode}-${deviceType}${(await this.customersService.increaseDeviceNumber(job.customer.id, deviceType)).toString().padStart(3, '0')}`,
      type: deviceType,
      serialNumber: job.deviceSerialNumber,
      customerId: job.customer.id,
      createdBy: 'system',
    });

    job.device = newDevice;

    this.em.persist(newDevice);
    this.em.persist(job);

    await this.em.flush();
    return job;
  }

  async registerJob(
    registerJobDto: RegisterJobDto,
  ): Promise<{ jobId: string; deviceToken: string }> {
    this.logger.debug(
      `Registering job for device with serial: ${registerJobDto.deviceSerial} for organization ${registerJobDto.organizationId}`,
    );

    let device = await this.devicesService.findOneBySerial(registerJobDto.deviceSerial);

    if (device) {
      throw new BadRequestMTIException(
        MTIErrorCodes.DEVICE_ALREADY_REGISTERED,
        `Device with serial ${registerJobDto.deviceSerial} already exists`,
      );
    }

    this.logger.debug(`Creating new device with serial ${registerJobDto.deviceSerial}`);
    device = await this.devicesService.create({
      name: registerJobDto.deviceName,
      type: registerJobDto.deviceType,
      serialNumber: registerJobDto.deviceSerial,
      customerId: registerJobDto.organizationId,
      createdBy: 'autosetup',
    });

    this.logger.debug(
      `Device with serial ${registerJobDto.deviceSerial} created with ID ${device.id}`,
    );

    const job = this.jobRepository.create({
      device: device,
      customer: device.customer,
      status: JobStatus.WAITING_FOR_INSTRUCTIONS,
    });

    await this.em.persistAndFlush(job);
    this.logger.debug(`Job created with ID ${job.id}`);
    return { deviceToken: device.deviceSecret, jobId: job.id };
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

  async updateStatus(id: string, status: JobStatus): Promise<JobEntity> {
    const job = await this.findOne(id);
    job.status = status;

    if (status === JobStatus.DONE) {
      this.logger.debug(`Job with ID ${id} is done, sending email...`);
      job.completedAt = new Date();
      this.mailService
        .sendEmail(
          `Imaging "${job.device.name}" completed`,
          `The imaging process has been completed successfully.
Visit https://cwi.eu.itglue.com/${job.customer.itGlueId}/configurations/${job.device.itGlueId} to check ITGlue.

        `,
        )
        .then(() => {});
    }

    await this.em.flush();
    return job;
  }

  async remove(id: string): Promise<void> {
    const job = await this.findOne(id);
    await this.em.removeAndFlush(job);
  }

  async clientPxeNotification(clientInfo: ClientInfoDto): Promise<string> {
    this.logger.log(`Client ${clientInfo.clientIp} notified us about connection...`);
    let job = await this.jobRepository.findOne({
      deviceSerialNumber: clientInfo.clientSerialNumber,
      $not: { status: JobStatus.DONE },
    });

    if (job) {
      this.logger.debug(
        `Found job for client ${clientInfo.clientIp} with ID ${job.id}, updating status to "pxe-selection"`,
      );
      await this.updateStatus(job.id, JobStatus.PXE_SELECTION);
    } else {
      this.logger.debug(`No job found for client ${clientInfo.clientIp}, creating new job...`);
      job = this.jobRepository.create({
        status: JobStatus.PXE_SELECTION,
        deviceSerialNumber: clientInfo.clientSerialNumber,
      });
    }

    job.connections.add(new JobConnectionsEntity(clientInfo));
    await this.em.persistAndFlush(job);

    return `
echo "Server connection successfull!"
configfile grub/config/main.cfg
    `;
  }

  async clientNotification(jobId: string, status: JobStatus): Promise<void> {
    this.logger.debug(`Client notified us about current status ${status} for job  ${jobId}...`);
    await this.updateStatus(jobId, status);
  }

  async taskNotification(jobId: string, taskInfo: TaskInfoDto): Promise<void> {
    this.logger.debug(
      `Client notified us about task status ${taskInfo.status} for job  ${jobId}...`,
    );
  }
}
