import { useState } from 'react';
import { useTasks } from '../../hooks/useTasks';
import { Task } from '../../types/task.interface';
import { Check, Plus, X, AlertCircle } from 'lucide-react';
import { ConfirmDeleteModal } from '../utils/ConfirmDeleteModal';
import { EntityList } from '../utils/EntityList';
import { TaskModal } from './TaskModal.component';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

export function TaskList() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
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
        queryClient.invalidateQueries({ queryKey: ['taskBundles'] });
        setIsModalOpen(false);
        setSelectedTask(null);
    };

    const handleDelete = (task: Task) => {
        setTaskToDelete(task);
    };
    const confirmDelete = () => {
        if (taskToDelete) {
            deleteTaskMutation.mutate(taskToDelete.id);
            setTaskToDelete(null);
        }
    };
    const cancelDelete = () => {
        setTaskToDelete(null);
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
                    { label: 'Global', render: (task) => (task.global ? (<Check />) : (<X />)) },
                ]}
                actions={[
                    {
                        label: 'Edit', onClick: (task) => { setIsModalOpen(true); setSelectedTask(task); },
                    },
                    {
                        label: 'Delete', onClick: handleDelete, danger: true,
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
            <ConfirmDeleteModal
                isOpen={!!taskToDelete}
                title="Delete Task"
                entityName={taskToDelete?.name || ''}
                onCancel={cancelDelete}
                onConfirm={confirmDelete}
            />
        </div>
    );
}
