import { TasksEntity } from "../task.entity";
import { BUILT_IN_TASK_PREFIX } from "./builtin-prefix";
import { readScript } from "./task-builtin-seed";

const installScript = readScript('domainjoin/install.ps1');
const verifyScript = readScript('domainjoin/verify.ps1');

export const TASK_BUILTIN_DOMAINJOIN: Partial<TasksEntity>  = {
    id: BUILT_IN_TASK_PREFIX + '000',
    builtIn: true,
    name: 'Automated Domain Join',
    description: 'Automatically joins the device to a domain.',
    global: true,
    installScript,
    verifyScript,
}

