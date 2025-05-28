import 'multer';
import { BadRequestMTIException } from 'src/core/errorhandling/exceptions/bad-request.mti-exception';
import { MTIHttpException } from 'src/core/errorhandling/exceptions/mit-exception';
import { MTIErrorCodes } from 'src/core/errorhandling/exceptions/mti.error-codes.enum';
import { ARCHIVE_FILE_MIME_TYPES_REGEXP } from 'src/fileManagement/file-management.config.service';
import { LocalFileUploadInterceptor } from 'src/fileManagement/local-file/local-file-upload.interceptor';

import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Param,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CreateTaskDto } from './dto/task-create.dto';
import { TaskBundleEntity } from './entities/task-bundle.entity';
import { TasksEntity } from './entities/task.entity';
import { TaskService } from './task.service';

@ApiTags('tasks')
@Controller('tasks')
export class TaskController {
  private readonly logger = new Logger('TaskController');

  constructor(private readonly taskService: TaskService) {}

  @Get()
  async getTasks(): Promise<TasksEntity[]> {
    this.logger.debug('Getting tasklist');

    return this.taskService.getTasks();
  }

  @Post()
  async createTask(@Body() createTaskDto: CreateTaskDto): Promise<TasksEntity> {
    this.logger.debug('Creating a new task');
    return this.taskService.createTask(createTaskDto);
  }

  @Post(':id/content')
  @UseInterceptors(LocalFileUploadInterceptor({ fieldName: 'file', path: 'tasksContent' }))
  async uploadTaskContent(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: ARCHIVE_FILE_MIME_TYPES_REGEXP,
        })
        .build({
          exceptionFactory: () =>
            new MTIHttpException(
              MTIErrorCodes.TASK_FILE_TYPE_INVALID,
              `Uploaded file type is not supported. Only archive files are allowed.`,
              HttpStatus.UNSUPPORTED_MEDIA_TYPE,
            ),
        }),
    )
    file: Express.Multer.File,
  ): Promise<void> {
    this.logger.debug(`Uploading content for task ${id} with file ${file.originalname}`);

    return this.taskService.uploadTaskContent(id, file);
  }

  @Post(':taskId/bundle/:bundleId')
  async assignTaskToBundle(
    @Param('bundleId') bundleId: string,
    @Param('taskId') taskId: string,
    @Body('order') order?: number,
  ): Promise<TaskBundleEntity> {
    return this.taskService.assignTaskToBundle(taskId, bundleId, order);
  }

  @Post('/bundle/:bundleId/tasks')
  async bulkSetTasks(
    @Param('bundleId') bundleId: string,
    @Body('taskIds') taskIds: string[],
  ): Promise<TaskBundleEntity> {
    return this.taskService.bulkSetTasks(bundleId, taskIds);
  }
}
