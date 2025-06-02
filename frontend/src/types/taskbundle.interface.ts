// src/types/taskbundle.interface.ts
import type { Task } from './task.interface';

export interface TaskBundle {
    id: string;
    name: string;
    description?: string;
    global: boolean;
    createdAt: string;
    taskList: Task[];
    customerIds?: string[]; // Add this line for customer assignment
}
