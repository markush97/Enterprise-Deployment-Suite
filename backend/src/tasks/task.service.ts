import * as archiver from 'archiver';
import { join } from 'path';
import { BadRequestMTIException } from 'src/core/errorhandling/exceptions/bad-request.mti-exception';
import { MTIHttpException } from 'src/core/errorhandling/exceptions/mit-exception';
import { MTIErrorCodes } from 'src/core/errorhandling/exceptions/mti.error-codes.enum';
import { NotFoundMTIException } from 'src/core/errorhandling/exceptions/not-found.mti-exception';
import { CustomerEntity } from 'src/customers/entities/customer.entity';
import { FileManagementConfigService } from 'src/fileManagement/file-management.config.service';
import { LocalFileService } from 'src/fileManagement/local-file/local-file.service';
import Stream from 'stream';

import { HttpStatus, Injectable, Logger } from '@nestjs/common';

import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';

import { CreateTaskBundleDto } from './dto/task-bundle-create.dto';
import { CreateTaskDto } from './dto/task-create.dto';
import { TaskBundleEntity } from './entities/task-bundle.entity';
import { TaskOrderEntity } from './entities/task-order.entity';
import { TasksEntity as TaskEntity } from './entities/task.entity';

@Injectable()
export class TaskService {
  private readonly logger = new Logger('TasksService');

  constructor(
    @InjectRepository(TaskEntity)
    private readonly taskRepository: EntityRepository<TaskEntity>,
    @InjectRepository(TaskBundleEntity)
    private readonly taskBundleRepository: EntityRepository<TaskBundleEntity>,
    @InjectRepository(TaskOrderEntity)
    private readonly taskOrderRepository: EntityRepository<TaskOrderEntity>,
    private readonly em: EntityManager,
    private readonly localFileService: LocalFileService,
    private readonly fileConfigService: FileManagementConfigService,
  ) {}

  public async getTasks(): Promise<TaskEntity[]> {
    this.logger.debug('Getting task list');
    return this.taskRepository.findAll({ filters: {}, populate: ['contentFile'] });
  }

  public async createTaskBundle(
    createTaskBundleDto: CreateTaskBundleDto,
  ): Promise<TaskBundleEntity> {
    this.logger.debug(`Creating a new task bundle ${createTaskBundleDto.name}`);
    const taskBundle = this.taskBundleRepository.create(createTaskBundleDto);
    await this.em.persistAndFlush(taskBundle);
    return taskBundle;
  }

  public async assignTaskToBundle(
    taskId: string,
    bundleId: string,
    order?: number,
  ): Promise<TaskBundleEntity> {
    this.logger.debug(`Assigning task ${taskId} to bundle ${bundleId} with order ${order}`);

    const task = await this.taskRepository.findOneOrFail(taskId, { populate: ['customers'] });
    const bundle = await this.taskBundleRepository.findOneOrFail(bundleId, {
      populate: ['taskList', 'customers'],
    });

    if (!this.canAddTaskToBundle(task, bundle) || bundle.taskList.contains(task)) {
      throw new BadRequestMTIException(
        MTIErrorCodes.TASK_NOT_ASSIGNABLE_TO_TASKBUNDLE,
        `Task ${taskId} cannot be assigned to bundle ${bundleId} due to customer mismatch or duplicate task.`,
      );
    }

    order ??= bundle.taskList.count(); // Default to end of list if no order specified

    const pivot = this.taskOrderRepository.create({
      task,
      bundle,
      order,
    });
    await this.em.persistAndFlush(pivot);

    return bundle;
  }

  /**
   * Sets the tasks of a bundle to exactly the provided taskIds, in the given order.
   * Removes tasks not in the list, adds new ones, and reorders as needed.
   */
  public async bulkSetTasks(bundleId: string, taskIds: string[]): Promise<TaskBundleEntity> {
    this.logger.debug(`Setting tasks in bundle ${bundleId}`);
    const bundle = await this.taskBundleRepository.findOneOrFail(bundleId, {
      populate: ['taskList', 'customers', 'taskList.customers'],
    });

    // Remove tasks not in the new list
    const currentTasks = bundle.taskList.getItems();
    const toRemove = currentTasks.filter(task => !taskIds.includes(task.id));
    bundle.taskList.remove(toRemove);

    // Add new tasks and set order
    for (let i = 0; i < taskIds.length; i++) {
      const taskId = taskIds[i];
      let task = currentTasks.find(t => t.id === taskId);

      if (!task) {
        // load task if it is not yet added to the bundle
        task = await this.taskRepository.findOneOrFail(taskId, { populate: ['customers'] });
      }

      // Check if task is assignable to bundle
      if (!this.canAddTaskToBundle(task, bundle)) {
        throw new BadRequestMTIException(
          MTIErrorCodes.TASK_NOT_ASSIGNABLE_TO_TASKBUNDLE,
          `Task ${taskId} cannot be assigned to bundle ${bundleId} due to customer mismatch.`,
        );
      }

      // Set task-order in bundle
      let pivot = await this.taskOrderRepository.findOne({ task, bundle });
      if (!pivot) {
        pivot = this.taskOrderRepository.create({ task, bundle, order: i });
      } else {
        pivot.order = i;
      }
      this.em.persist(pivot);
    }

    await this.em.persistAndFlush(bundle);
    this.logger.debug(`Tasks in bundle ${bundleId} set successfully`);
    return bundle;
  }

  public async createTask(createTaskDto: CreateTaskDto): Promise<TaskEntity> {
    this.logger.debug(`Creating a new task ${createTaskDto.name}`);
    const task = this.taskRepository.create(createTaskDto);
    await this.em.persistAndFlush(task);
    return task;
  }

  public async getTaskContent(id: string): Promise<archiver.Archiver> {
    this.logger.debug(`Getting content for task ${id}`);

    const task = await this.taskRepository.findOne(id, { populate: ['contentFile'] });
    if (!task || !task.contentFile) {
      throw new NotFoundMTIException(
        MTIErrorCodes.TASK_NOT_FOUND,
        `Task with id ${id} not found or has no content.`,
      );
    }

    return this.localFileService.getFileAsArchive(task.contentFile);
  }

  public async getTaskBundleContent(id: string): Promise<archiver.Archiver> {
    this.logger.debug(`Getting content for task-bundle ${id}`);

    const taskBundle = await this.taskBundleRepository.findOneOrFail(id, {
      populate: ['taskList', 'taskList.contentFile'],
    });

    return this.localFileService.getFilesAsArchive(
      taskBundle.taskList
        .getItems()
        .map(task => task.contentFile)
        .filter(file => file),
    );
  }

  public async saveTaskContent(id: string, file: Express.Multer.File): Promise<void> {
    this.logger.debug(`Saving content for task ${id}`);

    if (!('size' in file) || file.size > this.fileConfigService.maxUploadSize) {
      throw new MTIHttpException(
        MTIErrorCodes.TASK_FILE_SIZE_EXCEEDED,
        `Uploaded file with size ${file.size / 1024 / 1024} Megabytes is over the limit of ${this.fileConfigService.maxUploadSize} Megabytes.`,
        HttpStatus.PAYLOAD_TOO_LARGE,
      );
    }

    const task = await this.taskRepository.findOne(id);
    if (!task) {
      throw new NotFoundMTIException(MTIErrorCodes.TASK_NOT_FOUND, `Task with id ${id} not found`);
    }
    const fileMetadata = await this.localFileService.saveUnpackedArchive(
      file.buffer,
      join('tasks', id, 'content'),
    );
    task.contentFile = fileMetadata;
    await this.em.persistAndFlush(task);
  }

  private canAddTaskToBundle(task: TaskEntity, bundle: TaskBundleEntity): boolean {
    if (task.global) return true;
    return bundle.customers
      .getItems()
      .every((bundleCustomer: CustomerEntity) => task.customers.contains(bundleCustomer));
  }
}
