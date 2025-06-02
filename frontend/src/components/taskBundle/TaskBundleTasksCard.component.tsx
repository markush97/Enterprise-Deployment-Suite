import { useEffect, useState } from 'react';
import { Task } from '../../types/task.interface';
import { taskBundleService } from '../../services/taskbundle.service';
import { useTasks } from '../../hooks/useTasks';
import { Check, Trash2, ArrowUp, ArrowDown, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';

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
    const { tasksQuery } = useTasks();

    // Fetch bundle tasks
    useEffect(() => {
        setLoading(true);
        setError(null);
        taskBundleService.getTaskBundle(bundleId)
            .then(bundle => setTasks(bundle.taskList))
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
            await taskBundleService.assignAndOrderTasks(bundleId, tasks.map(t => t.id));
            setIsEditing(false);
            toast.success('Task order updated successfully');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg mt-6">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tasks in this Bundle</h3>
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
                                <li key={task.id} className="flex items-center justify-between py-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-900 dark:text-white">{task.name}</span>
                                        {task.global && <Check className="h-4 w-4 text-blue-500" />}
                                    </div>
                                    <div className="flex items-center gap-1">
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
                                {allTasks.filter(t => !tasks.some(assigned => assigned.id === t.id)).map(task => (
                                    <option key={task.id} value={task.id}>{task.name}</option>
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
