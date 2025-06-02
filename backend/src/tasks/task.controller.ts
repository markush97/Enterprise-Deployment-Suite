import * as archiver from 'archiver';
import { Response } from 'express';
import { stat } from 'fs/promises';
import 'multer';
import { Public } from 'src/auth/decorators/public.decorator';
import { InternalMTIException } from 'src/core/errorhandling/exceptions/internal.mti-exception';
import { MTIHttpException } from 'src/core/errorhandling/exceptions/mit-exception';
import { MTIErrorCodes } from 'src/core/errorhandling/exceptions/mti.error-codes.enum';
import { NotFoundMTIException } from 'src/core/errorhandling/exceptions/not-found.mti-exception';
import { ARCHIVE_FILE_MIME_TYPES_REGEXP } from 'src/fileManagement/file-management.config.service';
import { FileOverviewDto } from 'src/fileManagement/local-file/file-overview.dto';
import { LocalFileUploadInterceptor } from 'src/fileManagement/local-file/local-file-upload.interceptor';

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  ParseFilePipeBuilder,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CreateTaskBundleDto } from './dto/task-bundle-create.dto';
import { UpdateTaskBundleDto } from './dto/task-bundle-update.dto';
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

  @Get('bundles')
  async getTaskbudles(): Promise<TaskBundleEntity[]> {
    this.logger.debug('Getting Task Bundles');

    return this.taskService.getTaskBundles();
  }

  @Get('bundles/:id')
  async getTaskbudle(@Param('id') taskBundleId: string): Promise<TaskBundleEntity> {
    this.logger.debug('Getting Task Bundle with id ' + taskBundleId);

    return this.taskService.getTaskBundle(taskBundleId);
  }

  @Get(':id/content')
  @UseInterceptors(LocalFileUploadInterceptor({ fieldName: 'file', path: 'tasksContent' }))
  async downloadTaskContent(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    this.logger.debug(`Downloading content for task ${id}`);

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=task-${id}-content.zip`);

    const stream = await this.taskService.getTaskContent(id);

    stream.pipe(res);
    await stream.finalize();
  }

  @Get(':id/contentOverview')
  async getTaskContentOverview(@Param('id') taskId: string): Promise<FileOverviewDto> {
    this.logger.debug(`Getting content overview for task ${taskId}`);

    return this.taskService.getTaskContentOverivew(taskId);
  }

  @Get('bundles/:bundleId/content')
  @UseInterceptors(LocalFileUploadInterceptor({ fieldName: 'file', path: 'tasksContent' }))
  async downloadTaskBundleContent(
    @Param('bundleId') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    this.logger.debug(`Downloading content for task-bundle ${id}`);

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=task-${id}-content.zip`);

    const stream = await this.taskService.getTaskBundleContent(id);

    stream.pipe(res);
    await stream.finalize();
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
    this.logger.debug(`Uploading content for task ${id} with file '${file.originalname}'`);

    return this.taskService.saveTaskContent(id, file);
  }

  @Post(':taskId/bundles/:bundleId')
  async assignTaskToBundle(
    @Param('bundleId') bundleId: string,
    @Param('taskId') taskId: string,
    @Body('order') order?: number,
  ): Promise<TaskBundleEntity> {
    return this.taskService.assignTaskToBundle(taskId, bundleId, order);
  }

  @Post('bundles')
  async createTaskBundle(@Body() taskBundle: CreateTaskBundleDto): Promise<TaskBundleEntity> {
    this.logger.debug('Creating a new task bundle');
    return this.taskService.createTaskBundle(taskBundle);
  }

  @Post('bundles/:bundleId/tasks')
  async bulkSetTasks(
    @Param('bundleId') bundleId: string,
    @Body('taskIds') taskIds: string[],
  ): Promise<TaskBundleEntity> {
    return this.taskService.bulkSetTasks(bundleId, taskIds);
  }

  @Patch('bundles/:id')
  async updateTaskBundle(
    @Param('id') taskBundleId: string,
    @Body() taskBundleInfo: UpdateTaskBundleDto,
  ): Promise<TaskBundleEntity> {
    this.logger.debug(`Updateing taskbundle with id ${taskBundleId}`);
    return this.taskService.updateTaskBundle(taskBundleId, taskBundleInfo);
  }

  @Patch(':id')
  async updateTask(
    @Param('id') taskId: string,
    @Body() taskInfo: Partial<TasksEntity>,
  ): Promise<TasksEntity> {
    this.logger.debug(`Updating task with id ${taskId}`);
    return this.taskService.updateTask(taskId, taskInfo);
  }

  @Delete('bundles/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTaskBundle(@Param('id') taskBundleId: string): Promise<void> {
    this.logger.debug(`Deleting taskbundle with id ${taskBundleId}`);
    return this.taskService.deleteTaskBundle(taskBundleId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTask(@Param('id') taskId: string): Promise<void> {
    this.logger.debug(`Deleting task with id ${taskId}`);
    return this.taskService.deleteTask(taskId);
  }
}
