import { useState } from 'react';
import { Task } from '../../types/task.interface';
import { taskService } from '../../services/task.service';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';

interface TaskPageProps {
    task: Task;
    onBack: () => void;
    onTaskUpdated?: (task: Task) => void;
    onTaskDeleted?: () => void;
    editMode?: boolean;
}

export function TaskDetail({ task, onBack, onTaskUpdated, onTaskDeleted, editMode }: TaskPageProps) {
    const [isEdit, setIsEdit] = useState(!!editMode);
    const [isDeleting, setIsDeleting] = useState(false);
    const [form, setForm] = useState({
        name: task.name,
        description: task.description || '',
        global: task.global,
        installScript: task.installScript || '',
    });
    const navigate = useNavigate();

    const handleEdit = async () => {
        try {
            const updated = await taskService.updateTask(task.id, form);
            toast.success('Task updated');
            setIsEdit(false);
            if (onTaskUpdated) onTaskUpdated(updated);
        } catch (e: any) {
            toast.error(e.message || 'Failed to update task');
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await taskService.deleteTask(task.id);
            toast.success('Task deleted');
            if (onTaskDeleted) onTaskDeleted();
            navigate('/tasks');
        } catch (e: any) {
            toast.error(e.message || 'Failed to delete task');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 p-6 rounded shadow">
            <button onClick={onBack} className="mb-4 flex items-center text-blue-600 hover:underline">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </button>
            {isEdit ? (
                <div>
                    <input
                        className="block w-full mb-2 p-2 border rounded"
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Task name"
                    />
                    <textarea
                        className="block w-full mb-2 p-2 border rounded"
                        value={form.description}
                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        placeholder="Description"
                    />
                    <label className="flex items-center mb-2">
                        <input
                            type="checkbox"
                            checked={form.global}
                            onChange={e => setForm(f => ({ ...f, global: e.target.checked }))}
                            className="mr-2"
                        />
                        Global
                    </label>
                    <textarea
                        className="block w-full mb-2 p-2 border rounded"
                        value={form.installScript}
                        onChange={e => setForm(f => ({ ...f, installScript: e.target.value }))}
                        placeholder="Install script"
                    />
                    <button onClick={handleEdit} className="bg-blue-600 text-white px-4 py-2 rounded mr-2">Save</button>
                    <button onClick={() => setIsEdit(false)} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
                </div>
            ) : (
                <div>
                    <h2 className="text-2xl font-bold mb-2">{task.name}</h2>
                    <p className="mb-2">{task.description}</p>
                    <div className="mb-2">Global: {task.global ? 'Yes' : 'No'}</div>
                    <pre className="bg-gray-100 dark:bg-gray-900 p-2 rounded mb-2 whitespace-pre-wrap">{task.installScript}</pre>
                    <button onClick={() => setIsEdit(true)} className="inline-flex items-center px-3 py-2 bg-yellow-500 text-white rounded mr-2">
                        <Edit className="h-4 w-4 mr-1" /> Edit
                    </button>
                    <button onClick={handleDelete} disabled={isDeleting} className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded">
                        <Trash2 className="h-4 w-4 mr-1" /> {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            )}
        </div>
    );
}
