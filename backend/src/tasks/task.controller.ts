import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { TasksService } from './task.service';

@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly taskService: TasksService) {}
}
