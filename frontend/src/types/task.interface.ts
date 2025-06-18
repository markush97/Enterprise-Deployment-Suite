// src/types/task.interface.ts
export interface Task {
    id: string;
    name: string;
    description?: string;
    global: boolean;
    installScript?: string;
    verifyScript?: string;
    createdAt: string;
    builtIn?: boolean;
}

export interface TaskBundle {
    id: string;
    name: string;
    description?: string;
    global: boolean;
    createdAt: string;
    taskList: Task[];
    customerIds?: string[];
}
