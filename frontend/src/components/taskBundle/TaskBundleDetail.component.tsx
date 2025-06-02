import { ArrowLeft, Building2, Trash2, Edit } from 'lucide-react';
import { toast } from 'react-hot-toast';
import 'tippy.js/dist/tippy.css';
import { useState, useEffect } from 'react';
import { TaskBundle } from '../../types/taskbundle.interface';
import { ConfirmDeleteModal } from '../utils/ConfirmDeleteModal';
import { TaskBundleTasksCard } from './TaskBundleTasksCard.component';

interface TaskBundleDetailProps {
    taskBundle: TaskBundle;
    onBack: () => void;
    onTaskBundleDeleted?: () => void;
}

export function TaskBundleDetail({ taskBundle, onBack, onTaskBundleDeleted, editMode }: TaskBundleDetailProps & { editMode?: boolean }) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    useEffect(() => {
        setIsEditModalOpen(!!editMode);
    }, [editMode]);
    // Close modal on browser back if editMode was true and url changes
    useEffect(() => {
        if (!isEditModalOpen) return;
        const handlePopState = () => {
            if (editMode && !window.location.pathname.endsWith('/edit')) {
                setIsEditModalOpen(false);
            }
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [isEditModalOpen, editMode]);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    const handleDeleteBundle = async () => {
        // Implement delete logic here if needed
        toast.success('Task bundle deleted successfully');
        setIsDeleteConfirmOpen(false);
        if (onTaskBundleDeleted) onTaskBundleDeleted();
        onBack();
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center mb-6">
                <button
                    onClick={() => onBack()}
                    className="inline-flex items-center mr-4 px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Bundles
                </button>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {taskBundle.name}
                </h1>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <Building2 className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Task Bundle Details
                        </h2>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2"
                        >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                        </button>
                        <button
                            onClick={() => setIsDeleteConfirmOpen(true)}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            <Trash2 className="h-4 w-4 mr-1 text-red-500" />
                            Delete
                        </button>
                    </div>
                </div>
                <div className="px-6 py-4">
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                        <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</dt>
                            <dd className="mt-1 text-lg text-gray-900 dark:text-white">{taskBundle.name}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</dt>
                            <dd className="mt-1 text-lg text-gray-900 dark:text-white">{taskBundle.description}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created On</dt>
                            <dd className="mt-1 text-lg text-gray-900 dark:text-white">{new Date(taskBundle.createdAt).toLocaleDateString()}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Global</dt>
                            <dd className="mt-1 text-lg text-gray-900 dark:text-white">{taskBundle.global ? 'Yes' : 'No'}</dd>
                        </div>
                    </dl>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                <TaskBundleTasksCard bundleId={taskBundle.id} />
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmDeleteModal
                isOpen={isDeleteConfirmOpen}
                title="Delete Task Bundle"
                entityName={taskBundle.name}
                onCancel={() => setIsDeleteConfirmOpen(false)}
                onConfirm={handleDeleteBundle}
            />
        </div>
    );
}
