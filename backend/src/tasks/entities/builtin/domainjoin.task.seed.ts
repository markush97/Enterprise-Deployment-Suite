import { TasksEntity } from "../task.entity";
import { BUILT_IN_TASK_PREFIX } from "./task-builtin-seed";

const domainJoinScript = `


`

export const domainJoinTask: Partial<TasksEntity>  = {
    id: BUILT_IN_TASK_PREFIX + '000',
    buildIn: true,
    name: 'Automated Domain Join',
    description: 'Automatically joins the device to a domain.',
    global: true,
    installScript: domainJoinScript,
    
}

