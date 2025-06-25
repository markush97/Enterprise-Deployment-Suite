import { resolve } from "path";
import { TasksEntity } from "../task.entity";
import { existsSync, readFileSync } from "fs";
import { TASK_BUILTIN_DOMAINJOIN } from "./domainjoin.task.seed";

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