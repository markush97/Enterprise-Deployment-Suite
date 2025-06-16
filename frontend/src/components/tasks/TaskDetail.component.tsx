import { ArrowLeft, Building2, Trash2, Edit, Files, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import 'tippy.js/dist/tippy.css';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Task } from '../../types/task.interface';
import { TaskModal } from './TaskModal.component';
import { taskService } from '../../services/task.service';
import { TaskContentOverviewCard } from './TaskContentOverview.component';
import { UploadDropzone } from './UploadModal.component';
import { ConfirmDeleteModal } from '../utils/ConfirmDeleteModal';
import { ScriptContentCard } from './ScriptContentCard.component';

interface TaskDetailProps {
    task: Task;
    onBack: () => void;
    onTaskUpdated?: (task: Task) => void;
    onTaskDeleted?: () => void;
}

export function TaskDetail({ task, onBack, onTaskUpdated, onTaskDeleted, editMode }: TaskDetailProps & { editMode?: boolean }) {
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
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [contentOverviewKey, setContentOverviewKey] = useState(0);
    const [hasContent, setHasContent] = useState<boolean>(false);
    const [savingScript, setSavingScript] = useState(false);
    const navigate = useNavigate();


    const handleEditTask = async (data: Partial<Task>): Promise<void> => {
        try {
            const updateTask = await taskService.updateTask(task.id, data);
            if (onTaskUpdated) {
                onTaskUpdated(updateTask);
            }
            toast.success('Task updated successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to update task');
            throw error;
        }
    };

    const handleDeleteTask = async () => {
        try {
            setIsDeleting(true);
            await taskService.deleteTask(task.id);
            toast.success('Task deleted successfully');
            if (onTaskDeleted) {
                onTaskDeleted();
            }
            onBack();
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete task');
        } finally {
            setIsDeleting(false);
            setIsDeleteConfirmOpen(false);
        }
    };

    const handleUploadContent = async (file: File, onSuccess?: () => void) => {
        setIsUploading(true);
        setUploadError(null);
        const formData = new FormData();
        formData.append('file', file);
        try {
            await taskService.uploadTaskContent(task.id, formData);
            toast.success('Content uploaded successfully');
            setIsUploadModalOpen(false);
            setContentOverviewKey(k => k + 1); // force refresh
            if (onSuccess) onSuccess();
        } catch (error: any) {
            setUploadError(error.message || 'Failed to upload content');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSaveScript = async (newScript: string) => {
        setSavingScript(true);
        try {
            await handleEditTask({ installScript: newScript });
        } finally {
            setSavingScript(false);
        }
    };

    // Fetch content overview on mount and when contentOverviewKey changes
    useEffect(() => {
        let isMounted = true;
        taskService.getTaskContentOverview(task.id)
            .then((overview) => { if (isMounted) setHasContent(!!overview); })
            .catch(() => { if (isMounted) setHasContent(false); });
        return () => { isMounted = false; };
    }, [task.id, contentOverviewKey]);

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center mb-6">
                <button
                    onClick={() => onBack()}
                    className="inline-flex items-center mr-4 px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Tasks
                </button>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {task.name}
                </h1>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <Building2 className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Task Details
                        </h2>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2"
                        >
                            <Files className="h-4 w-4 mr-1" />
                            Upload Content
                        </button>
                        {hasContent && (
                            <a
                                href={`/api/tasks/${task.id}/content`}
                                download
                                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2"
                                title="Download content"
                            >
                                <Download className="h-4 w-4 mr-1 text-blue-500" />
                                Download
                            </a>
                        )}
                        <button
                            onClick={() => navigate(`/tasks/${task.id}/edit`)}
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
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Name
                            </dt>
                            <dd className="mt-1 text-lg text-gray-900 dark:text-white">
                                {task.name}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Description
                            </dt>
                            <dd className="mt-1 text-lg text-gray-900 dark:text-white">
                                {task.description}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Created On
                            </dt>
                            <dd className="mt-1 text-lg text-gray-900 dark:text-white">
                                {new Date(task.createdAt).toLocaleDateString()}
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>

            {/* Script Content Card */}
            <ScriptContentCard
                script={task.installScript || ''}
                onSave={handleSaveScript}
                isSaving={savingScript}
            />

            {/* Task Content Overview Card */}
            <TaskContentOverviewCard key={contentOverviewKey} taskId={task.id} />

            {/* Edit Task Modal */}
            <TaskModal
                task={task}
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    // Remove /edit from the URL when closing the modal
                    if (editMode) {
                        navigate(`/tasks/${task.id}`, { replace: true });
                    }
                }}
                onSave={handleEditTask}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmDeleteModal
                isOpen={isDeleteConfirmOpen}
                title="Delete Task"
                entityName={task.name}
                onCancel={() => setIsDeleteConfirmOpen(false)}
                onConfirm={handleDeleteTask}
                isLoading={isDeleting}
            />

            {/* Upload Content Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6 relative animate-fadeIn">
                        <button
                            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            onClick={() => setIsUploadModalOpen(false)}
                            disabled={isUploading}
                        >
                            <span className="text-2xl">&times;</span>
                        </button>
                        <h2 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Upload Task Content</h2>
                        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                            Please select a <span className="font-semibold">.zip</span> file. Only zip-archives are allowed. The uploaded content will be attached to this task and can be used for deployment or configuration.
                        </p>
                        <UploadDropzone
                            isUploading={isUploading}
                            uploadError={uploadError}
                            onUpload={(file) => handleUploadContent(file)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

// Add global type declarations for the URL prefixes
declare global {
    interface Window {
        PULSEWAY_URL_PREFIX?: string;
        ZOHO_URL_PREFIX?: string;
        ITGLUE_URL_PREFIX?: string;
    }
}
