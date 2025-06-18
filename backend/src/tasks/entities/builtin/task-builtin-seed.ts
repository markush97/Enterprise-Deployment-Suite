import { resolve } from "path";
import { TasksEntity } from "../task.entity";
import { existsSync, readFileSync } from "fs";
import { TASK_BUILTIN_DOMAINJOIN } from "./domainjoin.task.seed";

export const BUILT_IN_TASK_PREFIX = '003946aa-ee3b-408a-9149-8b0a3027b';

export const BUILTIN_TASKS: Partial<TasksEntity>[] = [TASK_BUILTIN_DOMAINJOIN]

export function readScript(relPath: string): string {
  const possiblePaths = [
    resolve(__dirname, relPath),
    resolve(__dirname, '../../../../../resources/scripts/builtin/', relPath)
  ];
  for (const p of possiblePaths) {
    if (existsSync(p)) {
      return readFileSync(p, 'utf8');
    }
  }
  throw new Error(`Script not found: ${relPath}`);
}