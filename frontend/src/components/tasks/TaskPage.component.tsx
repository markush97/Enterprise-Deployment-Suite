import { Cpu } from "lucide-react";
import { TaskList } from "./TaskList.component";

export function TaskPage() {
    // ...your jobs page logic...
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Cpu className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Create and edit Tasks. A task is the fundamental part of any setup-process. It contains all files and scripts needed to setup an application or configure some settings. In other Tools this is often refered to as "Package".</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Jobs */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">Tasklist</h2>
                </div>
                <div className="p-6">
                    <TaskList />
                </div>
            </div>
        </div>
    );
}
