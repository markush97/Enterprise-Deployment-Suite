import { MTIErrorCodes } from 'src/core/errorhandling/exceptions/mti.error-codes.enum';
import { NotFoundMTIException } from 'src/core/errorhandling/exceptions/not-found.mti-exception';
import { LocalFileService } from 'src/fileManagement/local-file/local-file.service';

import { Injectable, Logger } from '@nestjs/common';

import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';

import { CreateTaskDto } from './dto/task-create.dto';
import { TasksEntity as TaskEntity } from './entities/task.entity';

@Injectable()
export class TaskService {
  private readonly logger = new Logger('TasksService');

  constructor(
    @InjectRepository(TaskEntity)
    private readonly taskRepository: EntityRepository<TaskEntity>,
    private readonly em: EntityManager,
    private readonly localFileService: LocalFileService,
  ) {}

  public async createTask(createTaskDto: CreateTaskDto): Promise<TaskEntity> {
    this.logger.debug(`Creating a new task ${createTaskDto.name}`);
    const task = this.taskRepository.create(createTaskDto);
    await this.em.persistAndFlush(task);
    return task;
  }

  public async uploadTaskContent(id: string, file: Express.Multer.File): Promise<void> {
    this.logger.debug(`Saving content for task ${id}`);

    const task = await this.taskRepository.findOne(id);
    if (!task) {
      this.logger.error(`Task with id ${id} not found`);
      throw new NotFoundMTIException(MTIErrorCodes.TASK_NOT_FOUND, `Task with id ${id} not found`);
    }
    const fileMetadata = await this.localFileService.createFileMetadata({
      filename: file.filename,
      path: file.path,
      originalFilename: file.originalname,
      mimetype: file.mimetype,
    });

    task.contentFile = fileMetadata;
    await this.em.persistAndFlush(task);
  }
}
