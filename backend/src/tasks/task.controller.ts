import 'multer';
import { LocalFileUploadInterceptor } from 'src/fileManagement/local-file/local-file-upload.interceptor';

import {
  Body,
  Controller,
  Get,
  Logger,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CreateTaskDto } from './dto/task-create.dto';
import { TasksEntity } from './entities/task.entity';
import { TaskService } from './task.service';

const MAX_UPLOAD_SIZE = 1000 * 1000 * 150; // 150 MB

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
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: MAX_UPLOAD_SIZE })],
      }),
    )
    file: Express.Multer.File,
  ): Promise<void> {
    this.logger.debug(`Uploading content for task ${id} with file ${file.originalname}`);
    return this.taskService.uploadTaskContent(id, file);
  }
}
