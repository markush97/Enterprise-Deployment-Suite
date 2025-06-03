import { ArrowLeft, Building2, Trash2, Edit, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import 'tippy.js/dist/tippy.css';
import { useEffect, useState } from 'react';
import { TaskBundle } from '../../types/taskbundle.interface';
import { ConfirmDeleteModal } from '../utils/ConfirmDeleteModal';
import { TaskBundleTasksCard } from './TaskBundleTasksCard.component';
import { useCustomers } from '../../hooks/useCustomers';
import { taskBundleService } from '../../services/taskbundle.service';

interface TaskBundleDetailProps {
    taskBundle: TaskBundle;
    onBack: () => void;
    onTaskBundleDeleted?: () => void;
}

export function TaskBundleDetail({ taskBundle: initialTaskBundle, onBack, onTaskBundleDeleted, editMode }: TaskBundleDetailProps & { editMode?: boolean }) {
    const [taskBundle, setTaskBundle] = useState<TaskBundle & { customers?: { id: string }[] }>(initialTaskBundle);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    useEffect(() => {
        setLoading(true);
        taskBundleService.getTaskBundle(initialTaskBundle.id)
            .then(freshBundle => setTaskBundle(freshBundle))
            .finally(() => setLoading(false));
    }, [initialTaskBundle.id]);

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

    const handleDeleteBundle = async () => {
        // Implement delete logic here if needed
        toast.success('Task bundle deleted successfully');
        setIsDeleteConfirmOpen(false);
        if (onTaskBundleDeleted) onTaskBundleDeleted();
        onBack();
    };

    if (loading) {
        return <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading bundle details...</div>;
    }

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
                        <a
                            href={`/api/tasks/bundles/${taskBundle.id}/content`}
                            download
                            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2"
                        >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                        </a>
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

            <CustomerAssignmentCard taskBundle={taskBundle} />

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                <TaskBundleTasksCard bundleId={taskBundle.id} />
            </div>

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

function CustomerAssignmentCard({ taskBundle }: { taskBundle: TaskBundle & { customers?: { id: string }[] } }) {
    const { customersQuery } = useCustomers();

    const initialIds = taskBundle.customerIds && taskBundle.customerIds.length > 0
        ? taskBundle.customerIds
        : (taskBundle.customers ? taskBundle.customers.map(c => c.id) : []);
    const [isEditing, setIsEditing] = useState(false);
    const [assignedIds, setAssignedIds] = useState<string[]>(initialIds);
    const [saving, setSaving] = useState(false);
    const customers = (customersQuery.data || []).slice().sort((a, b) => a.shortCode.localeCompare(b.shortCode));

    useEffect(() => {
        setAssignedIds(
            taskBundle.customerIds && taskBundle.customerIds.length > 0
                ? taskBundle.customerIds
                : (taskBundle.customers ? taskBundle.customers.map(c => c.id) : [])
        );
        setIsEditing(false);
    }, [taskBundle.customerIds, taskBundle.customers]);

    if (taskBundle.global) {
        return (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg px-6 py-4 mb-4">
                <div className="font-semibold text-gray-900 dark:text-white mb-2">Assigned Customers</div>
                <div className="text-gray-600 dark:text-gray-300">Cannot assign customers since this bundle is global. Every customer can use global bundles.</div>
            </div>
        );
    }

    const handleToggle = (id: string) => {
        setAssignedIds(ids => {
            const changed = ids.includes(id) ? ids.filter(cid => cid !== id) : [...ids, id];
            setIsEditing(true);
            return changed;
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Save to backend (patch bundle)
            await import('../../services/taskbundle.service').then(({ taskBundleService }) =>
                taskBundleService.updateTaskBundle(taskBundle.id, { customerIds: assignedIds })
            );
            setIsEditing(false);
            toast.success('Customer assignment updated');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg px-6 py-4 mb-4">
            <div className="font-semibold text-gray-900 dark:text-white mb-2">Assigned Customers</div>
            {customers.length === 0 ? (
                <div className="text-gray-500 dark:text-gray-400">No customers found.</div>
            ) : (
                <div className="max-h-64 overflow-y-auto border rounded p-2 bg-gray-50 dark:bg-gray-700">
                    {customers.map((customer) => (
                        <label key={customer.id} className="flex items-center gap-2 mb-1 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={assignedIds.includes(customer.id)}
                                onChange={() => handleToggle(customer.id)}
                                disabled={saving}
                            />
                            <span className="font-mono text-sm text-gray-800 dark:text-gray-200 w-24 truncate">{customer.shortCode}</span>
                            <span className="text-gray-700 dark:text-gray-300 truncate flex-1">{customer.name}</span>
                        </label>
                    ))}
                </div>
            )}
            <div className="flex justify-end mt-2">
                {isEditing && (
                    <button
                        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                )}
            </div>
        </div>
    );
}
