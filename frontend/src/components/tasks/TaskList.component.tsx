import { useState } from 'react';
import { useTasks } from '../../hooks/useTasks';
import { Task } from '../../types/task.interface';
import { Plus } from 'lucide-react';
import { EntityList } from '../utils/EntityList';
import { TaskModal } from './TaskModal.component';
import { useNavigate } from 'react-router-dom';

export function TaskList() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const navigate = useNavigate();
    const {
        tasksQuery,
        addTaskMutation,
        updateTaskMutation,
        deleteTaskMutation,
    } = useTasks();

    const { data: tasks = [], isLoading, isError, error } = tasksQuery;

    // Handle add/edit submit
    const handleSubmit = async (data: Omit<Task, 'id' | 'createdAt'>) => {
        if (selectedTask) {
            await updateTaskMutation.mutateAsync({ id: selectedTask.id, data });
        } else {
            await addTaskMutation.mutateAsync(data);
        }
        setIsModalOpen(false);
        setSelectedTask(null);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Tasks</h2>
                <button
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={() => { setIsModalOpen(true); setSelectedTask(null); }}
                >
                    <Plus className="h-4 w-4 mr-1" /> Add Task
                </button>
            </div>
            <EntityList<Task>
                data={tasks}
                columns={[
                    { label: 'Name', render: (task) => task.name },
                    { label: 'Description', render: (task) => task.description },
                    { label: 'Global', render: (task) => (task.global ? 'Yes' : 'No') },
                ]}
                actions={[
                    {
                        label: 'Edit', onClick: (task) => { setIsModalOpen(true); setSelectedTask(task); },
                    },
                    {
                        label: 'Delete', onClick: (task) => deleteTaskMutation.mutate(task.id), danger: true,
                    },
                ]}
                isLoading={isLoading}
                isError={isError}
                error={error ? (error as Error).message : undefined}
                onRowClick={(task) => navigate(`/tasks/${task.id}`)}
            />
            <TaskModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelectedTask(null); }}
                onSave={handleSubmit}
                task={selectedTask || undefined}
            />
        </div>
    );
}
