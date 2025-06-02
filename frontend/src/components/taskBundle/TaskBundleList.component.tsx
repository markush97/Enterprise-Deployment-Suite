import { useState } from 'react';
import { useTaskBundles } from '../../hooks/useTaskBundles';
import { TaskBundle } from '../../types/taskbundle.interface';
import { useNavigate } from 'react-router-dom';
import { EntityList } from '../utils/EntityList';
import { Check, Plus, X } from 'lucide-react';
import { TaskBundleModal } from './TaskBundleModal.component';
import { useQueryClient } from '@tanstack/react-query';
import { ConfirmDeleteModal } from '../utils/ConfirmDeleteModal';

export function TaskBundleList() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTaskBundle, setSelectedTaskBundle] = useState<TaskBundle | null>(null);
    const [bundleToDelete, setBundleToDelete] = useState<TaskBundle | null>(null);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const {
        taskBundlesQuery,
        addTaskBundleMutation,
        updateTaskBundleMutation,
        deleteTaskBundleMutation,
    } = useTaskBundles();

    const { data: taskBudles = [], isLoading, isError, error } = taskBundlesQuery;

    // Handle add/edit submit
    const handleSubmit = async (data: Omit<TaskBundle, 'id' | 'createdAt' | 'taskList'>) => {
        if (selectedTaskBundle) {
            await updateTaskBundleMutation.mutateAsync({ id: selectedTaskBundle.id, data });
        } else {
            await addTaskBundleMutation.mutateAsync(data);
        }
        queryClient.invalidateQueries({ queryKey: ['taskBundles'] });
        setIsModalOpen(false);
        setSelectedTaskBundle(null);
    };

    const handleDelete = (bundle: TaskBundle) => {
        setBundleToDelete(bundle);
    };

    const confirmDelete = () => {
        if (bundleToDelete) {
            deleteTaskBundleMutation.mutate(bundleToDelete.id);
            setBundleToDelete(null);
        }
    };

    const cancelDelete = () => {
        setBundleToDelete(null);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Tasks</h2>
                <button
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={() => { setIsModalOpen(true); setSelectedTaskBundle(null); }}
                >
                    <Plus className="h-4 w-4 mr-1" /> Add Bundle
                </button>
            </div>
            <EntityList<TaskBundle>
                data={taskBudles}
                columns={[
                    { label: 'Name', render: (bundle) => bundle.name },
                    { label: 'Description', render: (bundle) => bundle.description },
                    { label: 'Global', render: (bundle) => (bundle.global ? (<Check />) : (<X />)) },
                ]}
                actions={[
                    {
                        label: 'Edit', onClick: (bundle) => { setIsModalOpen(true); setSelectedTaskBundle(bundle); },
                    },
                    {
                        label: 'Delete', onClick: handleDelete, danger: true,
                    },
                ]}
                isLoading={isLoading}
                isError={isError}
                error={error ? (error as Error).message : undefined}
                onRowClick={(bundle) => navigate(`/taskbundles/${bundle.id}`)}
            />
            <TaskBundleModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelectedTaskBundle(null); }}
                onSave={handleSubmit}
                taskBundle={selectedTaskBundle || undefined}
            />
            <ConfirmDeleteModal
                isOpen={!!bundleToDelete}
                title="Delete Task Bundle"
                entityName={bundleToDelete?.name || ''}
                onCancel={cancelDelete}
                onConfirm={confirmDelete}
            />
        </div>
    );
}
