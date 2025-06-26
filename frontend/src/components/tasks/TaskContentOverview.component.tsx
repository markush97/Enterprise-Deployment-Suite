import { File, FolderOpen } from 'lucide-react';
import { useEffect, useState } from 'react';

import { taskService } from '../../services/task.service';
import type { TaskContentFileInfo } from '../../services/task.service';

export function TaskContentOverviewCard({ taskId }: { taskId: string }) {
  const [root, setRoot] = useState<TaskContentFileInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    taskService
      .getTaskContentOverview(taskId)
      .then(root => {
        if (isMounted) setRoot(root);
      })
      .catch(err => {
        // If 404, show a friendly message instead of error
        if (isMounted) {
          if (err?.response?.status === 404) {
            setRoot(null);
            setError(null);
          } else {
            setError(err.message || 'Failed to load files');
          }
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [taskId]);

  function renderFileTree(node: TaskContentFileInfo, depth = 0) {
    if (!node) return null;
    if (node.fileType === 'directory') {
      return (
        <li key={node.name + depth} className={depth === 0 ? '' : 'ml-4'}>
          <div className="flex items-center font-semibold text-blue-700 dark:text-blue-300">
            <FolderOpen className="h-4 w-4 mr-2 text-blue-500" />
            <span>{node.name}/</span>
          </div>
          {node.children && node.children.length > 0 && (
            <ul className="ml-6 border-l border-gray-200 dark:border-gray-700">
              {node.children.map(child => renderFileTree(child, depth + 1))}
            </ul>
          )}
        </li>
      );
    } else {
      return (
        <li key={node.name + depth} className="ml-4 flex items-center justify-between">
          <div className="flex items-center">
            <File className="h-4 w-4 mr-2 text-blue-400" />
            <span className="text-gray-900 dark:text-white">{node.name}</span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-4">
            {(node.fileSize / 1024).toFixed(1)} KB
          </span>
        </li>
      );
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg mt-6">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Attached Files</h3>
      </div>
      <div className="px-6 py-4">
        {loading ? (
          <div className="text-gray-500 dark:text-gray-400">Loading files...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : !root ? (
          <div className="text-gray-500 dark:text-gray-400">
            No content has been uploaded for this task yet.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">{renderFileTree(root)}</ul>
        )}
      </div>
    </div>
  );
}
