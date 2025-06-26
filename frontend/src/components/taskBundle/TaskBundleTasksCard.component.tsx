import { ArrowDown, ArrowUp, Check, Download, GripVertical, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import { useTasks } from '../../hooks/useTasks';
import { taskService } from '../../services/task.service';
import { taskBundleService } from '../../services/taskbundle.service';
import { Task } from '../../types/task.interface';

interface TaskBundleTasksCardProps {
  bundleId: string;
}

export function TaskBundleTasksCard({ bundleId }: TaskBundleTasksCardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [addTaskId, setAddTaskId] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [taskContentMap, setTaskContentMap] = useState<Record<string, boolean>>({});
  const { tasksQuery } = useTasks();

  // Drag-and-drop state
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  // Fetch bundle tasks
  useEffect(() => {
    setLoading(true);
    setError(null);
    taskBundleService
      .getTaskBundle(bundleId)
      .then(async bundle => {
        setTasks(bundle.taskList);
        // Fetch content overview for each task
        const entries = await Promise.all(
          bundle.taskList.map(async task => {
            try {
              const overview = await taskService.getTaskContentOverview(task.id);
              return [task.id, !!overview];
            } catch {
              return [task.id, false];
            }
          }),
        );
        setTaskContentMap(Object.fromEntries(entries));
      })
      .catch(e => setError(e.message || 'Failed to load tasks'))
      .finally(() => setLoading(false));
  }, [bundleId]);

  // Fetch all tasks for add dropdown
  useEffect(() => {
    if (tasksQuery.data) setAllTasks(tasksQuery.data);
  }, [tasksQuery.data]);

  const handleRemove = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
    setIsEditing(true);
  };
  const handleMove = (from: number, to: number) => {
    if (to < 0 || to >= tasks.length) return;
    const updated = [...tasks];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setTasks(updated);
    setIsEditing(true);
  };
  const handleAdd = () => {
    if (!addTaskId) return;
    const task = allTasks.find(t => t.id === addTaskId);
    if (task && !tasks.some(t => t.id === addTaskId)) {
      setTasks([...tasks, task]);
      setIsEditing(true);
      setAddTaskId('');
    }
  };
  const handleSave = async () => {
    setSaving(true);
    try {
      await taskBundleService.assignAndOrderTasks(
        bundleId,
        tasks.map(t => t.id),
      );
      setIsEditing(false);
      toast.success('Task order updated successfully');
    } finally {
      setSaving(false);
    }
  };

  const handleDragStart = (idx: number) => setDraggedIdx(idx);
  const handleDragOver = (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  const handleDrop = (idx: number) => {
    if (draggedIdx === null || draggedIdx === idx) return;
    handleMove(draggedIdx, idx);
    setDraggedIdx(null);
  };
  const handleDragEnd = () => setDraggedIdx(null);

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg mt-6">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Tasks in this Bundle
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-left">
            Tasks of this bundle are executed in the order that they are listed below
          </p>
        </div>
        {isEditing && (
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Order'}
          </button>
        )}
      </div>

      <div className="px-6 py-4">
        {loading ? (
          <div className="text-gray-500 dark:text-gray-400">Loading tasks...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {tasks.map((task, idx) => (
                <li
                  key={task.id}
                  className={`flex items-center justify-between py-2 transition-colors duration-200 ${draggedIdx === idx ? 'bg-blue-100 dark:bg-blue-900 scale-[1.02] shadow-lg z-10' : ''}`}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(idx)}
                  onDragEnd={handleDragEnd}
                  style={{ cursor: 'grab', opacity: draggedIdx === idx ? 0.7 : 1 }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center justify-center mr-2 ${draggedIdx === idx ? 'drag-bounce' : ''}`}
                      title="Drag to reorder"
                    >
                      <GripVertical className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">{task.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {taskContentMap[task.id] && (
                      <a
                        href={`/api/tasks/${task.id}/content`}
                        download
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                        title="Download content"
                      >
                        <Download className="h-4 w-4 text-blue-500" />
                      </a>
                    )}
                    <button
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                      onClick={() => handleMove(idx, idx - 1)}
                      disabled={idx === 0}
                      title="Move up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                      onClick={() => handleMove(idx, idx + 1)}
                      disabled={idx === tasks.length - 1}
                      title="Move down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900"
                      onClick={() => handleRemove(task.id)}
                      title="Remove"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2 mt-4">
              <select
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                value={addTaskId}
                onChange={e => setAddTaskId(e.target.value)}
                disabled={saving}
              >
                <option value="">Add task...</option>
                {allTasks
                  .filter(t => !tasks.some(assigned => assigned.id === t.id))
                  .map(task => (
                    <option key={task.id} value={task.id}>
                      {task.name}
                    </option>
                  ))}
              </select>
              <button
                className="px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                onClick={handleAdd}
                disabled={!addTaskId || saving}
                title="Add task"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Tailwind can't do keyframes in TSX, so use a <style> tag via JSX
export function TaskBundleTasksCardWithStyle(props: TaskBundleTasksCardProps) {
  return (
    <>
      <TaskBundleTasksCard {...props} />
      <style>{`
        @keyframes drag-bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
        }
        .drag-bounce {
            animation: drag-bounce 0.5s infinite;
        }
        `}</style>
    </>
  );
}
