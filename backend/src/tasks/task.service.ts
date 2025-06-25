import * as archiver from 'archiver';
import { join } from 'path';
import { BadRequestMTIException } from 'src/core/errorhandling/exceptions/bad-request.mti-exception';
import { MTIHttpException } from 'src/core/errorhandling/exceptions/mit-exception';
import { MTIErrorCodes } from 'src/core/errorhandling/exceptions/mti.error-codes.enum';
import { NotFoundMTIException } from 'src/core/errorhandling/exceptions/not-found.mti-exception';
import { CustomerEntity } from 'src/customers/entities/customer.entity';
import { FileManagementConfigService } from 'src/fileManagement/file-management.config.service';
import { LocalFileMetadataEntity } from 'src/fileManagement/local-file/local-file-metadata.entity';
import { LocalFileService } from 'src/fileManagement/local-file/local-file.service';

import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { EnsureRequestContext, EntityManager, EntityRepository, OnInit } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';

import { FileOverviewDto } from '../fileManagement/local-file/file-overview.dto';
import { CreateTaskBundleDto } from './dto/task-bundle-create.dto';
import { UpdateTaskBundleDto } from './dto/task-bundle-update.dto';
import { CreateTaskDto } from './dto/task-create.dto';
import { TaskBundleEntity } from './entities/task-bundle.entity';
import { TaskOrderEntity } from './entities/task-order.entity';
import { TasksEntity as TaskEntity } from './entities/task.entity';
import { BUILTIN_TASKS } from './entities/builtin/task-builtin-seed';

@Injectable()
export class TaskService implements OnModuleInit {
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
  ) { }

  async onModuleInit() {
    await this.createBuiltInTasks();
  }

  @EnsureRequestContext()
  private async createBuiltInTasks(): Promise<void> {
    this.logger.log(`Creating built-in tasks...`);
    for (const builtin of BUILTIN_TASKS) {
      const task = await this.taskRepository.findOne({ name: builtin.name, builtIn: true });
      
      if (!task) {
        this.taskRepository.create(builtin);
      }

      task.assign(builtin);
      task.builtIn = true;

      this.em.persist(task)
    }

    await this.em.flush();
  }

  public async getTasks(): Promise<TaskEntity[]> {
    return this.taskRepository.findAll({ filters: {}, populate: ['contentFile'] });
  }

  public async getTaskBundles(): Promise<TaskBundleEntity[]> {
    return this.taskBundleRepository.findAll({ filters: {} });
  }

  public async getTaskBundle(taskBundleId: string): Promise<TaskBundleEntity> {
    return this.taskBundleRepository.findOne(taskBundleId, { populate: ['taskList', 'customers'] });
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

  /**
   * Returns a overview of the content of the task. This is a list
   * that contains the file names and sizes of the files in the task following the correct structure.
   */
  public async getTaskContentOverivew(id: string): Promise<FileOverviewDto> {
    const task = await this.taskRepository.findOneOrFail(id, { populate: ['contentFile'] });
    if (!task || !task.contentFile) {
      throw new NotFoundMTIException(
        MTIErrorCodes.TASK_NOT_FOUND,
        `Task with id ${id} not found or has no content.`,
      );
    }
    return this.localFileService.getFilesOverview(task.contentFile);
  }

  public async getTaskBundleContent(
    id: string,
    basePathInZip?: string,
    rawContentOnly = true,
  ): Promise<archiver.Archiver> {
    this.logger.debug(`Getting content for task-bundle ${id}`);

    const taskBundle = await this.taskBundleRepository.findOneOrFail(id, {
      populate: ['taskList', 'taskList.contentFile'],
    });

    const tasks = taskBundle.taskList.getItems();
    const taskFiles = tasks
      .filter(task => task.contentFile) // Only include tasks with content
      .map<LocalFileMetadataEntity & { zipFolderName: string }>(task => {
        (task.contentFile as any).zipFolderName = join(basePathInZip, task.id);
        return task.contentFile as LocalFileMetadataEntity & { zipFolderName: string };
      });

    const archive = await this.localFileService.getFilesAsArchive(taskFiles);

    if (!rawContentOnly) {
      tasks.forEach(task => {
        if (task.installScript) {
          archive.append(task.installScript, { name: join(basePathInZip, task.id, 'install.ps1') });
        } else {
          archive.append('# No install script provided', {
            name: join(basePathInZip, task.id, 'install.ps1'),
          });
        }

        if (task.verifyScript) {
          archive.append(task.verifyScript, { name: join(basePathInZip, task.id, 'verify.ps1') });
        } else {
          archive.append('# No verify script provided', {
            name: join(basePathInZip, task.id, 'verify.ps1'),
          });
        }

        archive.append(JSON.stringify({...task.options, taskId: task.id, taskName: task.name ?? task.id}), { name: join(basePathInZip, task.id, 'task.json') })

      });
    }

    return archive;
  }

  public async deleteTask(id: string): Promise<void> {
    const task = await this.taskRepository.findOneOrFail(id, { populate: ['contentFile'] });
    if (task.contentFile) {
      await this.localFileService.deleteFile(task.contentFile);
    }
    await this.em.removeAndFlush(task);
    return;
  }

  public async deleteTaskBundle(id: string): Promise<void> {
    const taskBundle = this.taskBundleRepository.getReference(id);
    await this.em.removeAndFlush(taskBundle);
    return;
  }

  public async updateTaskBundle(
    taskBundleId: string,
    taskBundleInfo: UpdateTaskBundleDto,
  ): Promise<TaskBundleEntity> {
    this.logger.debug(`Updating task bundle with id ${taskBundleId}`);
    const bundle = await this.taskBundleRepository.findOneOrFail(taskBundleId);

    if (
      taskBundleInfo.global &&
      taskBundleInfo.customerIds &&
      taskBundleInfo.customerIds.length > 0
    ) {
      throw new BadRequestMTIException(
        MTIErrorCodes.GLOBAL_TASKBUNDLE_CANNOT_HAVE_CUSTOMERS,
        'A global task bundle cannot have customers assigned.',
      );
    }

    const customerIds = taskBundleInfo.customerIds || [];
    const { customerIds: _, ...rest } = taskBundleInfo;
    this.em.assign(bundle, rest);

    if (customerIds.length === 0) {
      bundle.customers.removeAll();
    } else {
      bundle.customers.set(
        customerIds.map(customerId => this.em.getReference(CustomerEntity, customerId)),
      );
    }

    await this.em.persistAndFlush(bundle);
    return bundle;
  }

  public async updateTask(taskId: string, taskInfo: Partial<TaskEntity>): Promise<TaskEntity> {
    this.logger.debug(`Updating task with id ${taskId}`);
    const task = await this.taskRepository.findOneOrFail(taskId);

    if (task.builtIn) {
      throw new BadRequestMTIException(
        MTIErrorCodes.CANNOT_EDIT_BUILD_IN_TASK,
        `Cannot edit built-in task ${task.name}.`,
      );
    }

    Object.assign(task, taskInfo);
    await this.em.persistAndFlush(task);
    return task;
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

    if (task.builtIn) {
      throw new BadRequestMTIException(
        MTIErrorCodes.CANNOT_EDIT_BUILD_IN_TASK,
        `Cannot edit built-in task ${task.name}.`,
      );
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
