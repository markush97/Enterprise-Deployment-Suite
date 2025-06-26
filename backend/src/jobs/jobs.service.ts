import * as archiver from 'archiver';
import { EMailService } from 'src/core/email/email.service';
import { BadRequestMTIException } from 'src/core/errorhandling/exceptions/bad-request.mti-exception';
import { MTIErrorCodes } from 'src/core/errorhandling/exceptions/mti.error-codes.enum';
import { DeviceType } from 'src/devices/entities/device.entity';
import { TaskService } from 'src/tasks/task.service';

import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';

import { EnsureRequestContext, EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';

import { CustomersService } from '../customers/customers.service';
import { DevicesService } from '../devices/devices.service';
import { ImagesService } from '../images/images.service';
import { ClientInfoDto } from './dto/client-info.dto';
import { CreateJobDto } from './dto/create-job.dto';
import { JobInstructionAction, JobInstructionsDto } from './dto/job-instructions.dto';
import { RegisterJobDto } from './dto/register-job.dto';
import { TaskInfoDto } from './dto/task-info.dto';
import { JobConnectionsEntity } from './entities/job-connections.entity';
import { JobEntity, JobStatus } from './entities/job.entity';
import { join } from 'path';
import { AccountEntity } from 'src/auth/entities/account.entity';
import { AuthService } from 'src/auth/auth.service';
import { CoreConfigService } from 'src/core/config/core.config.service';
import { CustomerEntity } from 'src/customers/entities/customer.entity';

@Injectable()
export class JobsService implements OnModuleInit {
  private readonly logger = new Logger('JobsService');

  constructor(
    @InjectRepository(JobEntity)
    private readonly jobRepository: EntityRepository<JobEntity>,
    private readonly devicesService: DevicesService,
    private readonly customersService: CustomersService,
    private readonly imagesService: ImagesService,
    private readonly authService: AuthService,
    private readonly mailService: EMailService,
    private readonly em: EntityManager,
    private readonly taskService: TaskService,
    private readonly coreConfig: CoreConfigService
  ) { }

  async onModuleInit() {
    await this.checkForStuckJobs()
  }

  async findAll(): Promise<JobEntity[]> {
    this.logger.debug('Fetching all jobs');
    return this.jobRepository.findAll({
      populate: ['device', 'customer', 'image', 'taskBundle'],
      orderBy: { createdAt: 'DESC' },
    });
  }

  async findOneOrFail(id: string): Promise<JobEntity> {
    this.logger.debug(`Searching for job with ID ${id}`);
    const job = await this.jobRepository.findOne(id, {
      populate: ['device', 'customer', 'image', 'taskBundle', 'startedBy'],
    });
    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    return job;
  }

  async getJobInstructions(id: string): Promise<JobInstructionsDto> {
    const job = await this.jobRepository.findOneOrFail(id, { populate: [ 'customer', 'taskBundle'] });
    const device = await this.devicesService.findOneWithPassword(job.device.id);
  
    job.lastConnection = new Date();
    await this.em.persistAndFlush(job);

    if (job.status === JobStatus.WAITING_FOR_INSTRUCTIONS) {
      return {
        action: JobInstructionAction.WAIT_FOR_INSTRUCTIONS,
      };
    } else if (job.status === JobStatus.STARTING) {
      console.log(device)
      return {
        action: JobInstructionAction.START_INSTALLATION,
        context: {
          deviceName: device.name,
          organisationName: job.customer?.name,
          organisationShortName: job.customer?.shortCode,
          organisationId: job.customer?.id,
          startedBy: job.startedBy?.name,
          startedById: job.startedBy?.id,
          localPassword: device.localPassword,
        }
      }
    }
  }

  async getJobContent(id: string): Promise<archiver.Archiver> {
    const job = await this.jobRepository.findOneOrFail(id, {
      populate: ['device', 'customer', 'taskBundle'],
    });
    const taskBundle = job.taskBundle;
    if (!taskBundle) {
      throw new BadRequestMTIException(
        MTIErrorCodes.JOB_NO_TASK_BUNDLE,
        `Job with ID ${id} has no task bundle assigned. Cannot execute a job without a task bundle.`,
      );
    }

    const archive = await this.taskService.getTaskBundleContent(taskBundle.id, 'tasks', false);

    const jobData = {
      jobId: job.id,
      customerId: job.customer?.id,
      customerName: job.customer?.name,
      customerShortCode: job.customer?.shortCode,
      localLogPath: this.coreConfig.localWindowsInstallerLogPath + '\\install.log',
      apiUrl: this.coreConfig.apiUrl,
      entraTenant: job.customer?.entraTenantId,
      deviceName: job.device?.name,
      domainName: job.customer.adDomain,
      jobConfig: {},
      pulsewayDownloadUrl: job.customer.pulsewayDownloadUrl,
      bitdefenderDownloadUrl: job.customer.bitdefenderDownloadUrl,
      domainjoin: {
        username: job.customer.deviceEnrollmentCredentials?.username,
        password: job.customer.deviceEnrollmentCredentials?.password,
        ou: getOuForDeviceType(job.device?.type, job.customer),
      },
      assetTag: job.device?.assetTag,
      teamviewerId: job.customer?.teamviewerId,

    };

    archive.append(JSON.stringify(jobData), { name: 'job.json' });
    archive.file(join(__dirname, '../../../resources/scripts/main.ps1'), { name: 'main.ps1' });

    const psLoggingUtilsPath = join(__dirname, '../../../resources/scripts/utils');
    archive.directory(psLoggingUtilsPath, 'utils');

    return archive;
  }

  async assignJobToCustomer(jobId: string, customerId: string): Promise<JobEntity> {
    this.logger.debug(`Assigning job with ID ${jobId} to customer with ID ${customerId}`);
    const job = await this.findOneOrFail(jobId);
    const customer = await this.customersService.findOne(customerId);
    job.customer = customer;
    await this.em.flush();
    return job;
  }

  async registerJob(
    registerJobDto: RegisterJobDto,
  ): Promise<{ jobId: string; deviceToken: string, jobName?: string }> {
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
    return { deviceToken: device.deviceSecret, jobId: job.id, jobName: job.name };
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

  async updateStatus(job: JobEntity, status: JobStatus, user?: AccountEntity): Promise<JobEntity> {
    job.status = status;

    if (status === JobStatus.DONE) {
      this.logger.debug(`Job with ID ${job.id} is done, sending email...`);
      job.completedAt = new Date();
      this.mailService
        .sendEmail(
          `Imaging "${job.device.name}" completed`,
          `The imaging process has been completed successfully.
Visit https://cwi.eu.itglue.com/${job.customer.itGlueId}/configurations/${job.device.itGlueId} to check ITGlue.

Please login into the system aus the root user documented in ITGlue. Fill out the checklist https://cwi.eu.itglue.com/4037605574148284/checklists/4204549932564711 and 
then execute the following command to cleanup the device: "C:\\CWI\\setup-cleanup.ps1"

        `,
        )
        .then(() => { });
    }

    if (status === JobStatus.STARTING) {
      this.logger.debug(`Job with ID ${job.id} is starting`);
      job.startedBy = user;
    }

    await this.em.flush();
    return job;
  }

  async remove(id: string): Promise<void> {
    const job = await this.findOneOrFail(id);
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
      await this.updateStatus(job, JobStatus.PXE_SELECTION);
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

  async changeStatus(jobId: string, status: JobStatus, userId?: string): Promise<void> {
    this.logger.debug(`Status updated to ${status} for job  ${jobId}...`);
    const job = await this.findOneOrFail(jobId);
    const account = await this.authService.findOne(userId);
    await this.updateStatus(job, status, account);
  }

  async taskNotification(jobId: string, taskInfo: TaskInfoDto): Promise<void> {
    this.logger.debug(
      `Client notified us about task status ${taskInfo.status} for job  ${jobId}...`,
    );
  }

  async updateJob(
    id: string,
    update: { taskBundleId?: string; customerId?: string },
  ): Promise<JobEntity> {
    const job = await this.findOneOrFail(id);
    if (update.customerId) {
      const customer = await this.customersService.findOne(update.customerId);
      job.customer = customer;
      if (job.device) {
        job.device.customer = customer;
      }
    }

    if (update.taskBundleId) {
      const taskBundle = await this.taskService.getTaskBundle(update.taskBundleId);
      job.taskBundle = taskBundle;
    }
    await this.em.flush();
    return job;
  }

  /**
   * Timeout jobs stuck for more than 24 hours in certain statuses.
   */
  @Interval(1000 * 60 * 15) // Check every 15 minutes
  @EnsureRequestContext()
  async checkForStuckJobs() {
    this.logger.log('Checking for stuck jobs (installing, starting, imaging, pxe_selection, verifying)...');
    const stuckStatuses = [
      JobStatus.INSTALLING,
      JobStatus.STARTING,
      JobStatus.IMAGING,
      JobStatus.PXE_SELECTION,
      JobStatus.VERIFYING,
      JobStatus.WAITING_FOR_INSTRUCTIONS
    ];
    const fourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000); 
    const stuckJobs = await this.jobRepository.find({
      status: { $in: stuckStatuses },
      lastConnection: { $lt: fourHoursAgo },
    });
    for (const job of stuckJobs) {
      this.logger.warn(`Job ${job.id} has been stuck in status ${job.status} since ${job.lastConnection}, setting to TIMEOUT.`);
      job.status = JobStatus.TIMOUT;
      await this.em.persistAndFlush(job);
    }
    this.logger.log(`Checked ${stuckJobs.length} stuck jobs.`);
  }
}

function getOuForDeviceType(deviceType: DeviceType, customer: CustomerEntity): string {
  const domain = customer?.adDomain;
  const domainParts = domain ? domain.split('.').map(part => `DC=${part}`).join(',') : undefined;

  let ou: string | undefined;
  switch (deviceType) {
    case DeviceType.PC:
      ou = customer.deviceOUPc;
      break;
    case DeviceType.NOTEBOOK:
    case 'NB': // fallback for string value
      ou = customer.deviceOUNb;
      break;
    case DeviceType.TABLET:
    case 'TAB':
      ou = customer.deviceOUTab;
      break;
    case DeviceType.MAC:
      ou = customer.deviceOUMac;
      break;
    case DeviceType.SERVER:
    case 'SRV':
      ou = customer.deviceOUSrv;
      break;
    case DeviceType.OTHER:
    case 'DIV':
      ou = customer.deviceOUDiv;
      break;
    default:
      ou = undefined;
  }

  if (ou && ou.trim()) {
    return domainParts ? `${ou},${domainParts}` : ou;
  }
  return domainParts ? `OU=Computers,${domainParts}` : 'OU=Computers';
}