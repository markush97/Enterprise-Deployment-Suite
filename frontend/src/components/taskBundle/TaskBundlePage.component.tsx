import { Boxes } from "lucide-react";
import { TaskBundleList } from "./TaskBundleList.component";

export function TaskBundlePage() {
    // ...your jobs page logic...
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Boxes className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Task Bundles</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Group multiple tasks together. These are assigned to a job/device for a complete automated setup.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Jobs */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">Taskbundles</h2>
                </div>
                <div className="p-6">
                    <TaskBundleList />
                </div>
            </div>
        </div>
    );
}
