import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { jobService } from '../../services/job.service';
import type { Job } from '../../types/job.interface';
import { ArrowLeft, Ban, ChevronDownIcon, CrossIcon, Edit, Loader2, Server, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { JobModal } from './JobModal.component';
import { customerService } from '../../services/customer.service';
import { taskBundleService } from '../../services/taskbundle.service';
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';

interface JobDetailProps {
    job: Job;
    onBack: () => void;
    onJobUpdated?: (job: Job) => void;
    onJobDeleted?: () => void;
    editMode?: boolean;
}

export function JobDetail({ job, onBack, onJobUpdated, onJobDeleted, editMode }: JobDetailProps) {
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
    const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
    // Remove unused state
    // const [isCanceling, setIsCanceling] = useState(false);

    const [customerOptions, setCustomerOptions] = useState<{ id: string; name: string; shortCode: string }[]>([]);
    const [taskBundleOptions, setTaskBundleOptions] = useState<{ id: string; name: string; description?: string }[]>([]);
    // Use id if available, else try to match by shortCode
    const getCustomerId = () => {
        if (job.customer && 'id' in job.customer) return (job.customer as any).id;
        if (job.customer && job.customer.shortCode) {
            const found = customerOptions.find(c => c.shortCode === job.customer.shortCode);
            return found?.id || '';
        }
        return '';
    };
    const getTaskBundleId = () => {
        if (job.taskBundle && typeof job.taskBundle === 'object' && 'id' in job.taskBundle) return (job.taskBundle as any).id;
        if (job.taskBundle && typeof job.taskBundle === 'object' && 'name' in job.taskBundle) {
            const found = taskBundleOptions.find(tb => tb.name === (job.taskBundle as any).name);
            return found?.id || '';
        }
        return '';
    };
    const [selectedCustomer, setSelectedCustomer] = useState<string>(getCustomerId());
    const [selectedTaskBundle, setSelectedTaskBundle] = useState<string>(getTaskBundleId());
    const [isAssigning, setIsAssigning] = useState(false);

    // Local state for staged selection (not immediately applied)
    const [stagedCustomer, setStagedCustomer] = useState<string>(selectedCustomer);
    const [stagedTaskBundle, setStagedTaskBundle] = useState<string>(selectedTaskBundle);
    const [savingCustomer, setSavingCustomer] = useState(false);
    const [savingTaskBundle, setSavingTaskBundle] = useState(false);

    useEffect(() => {
        customerService.getCustomers().then((data) => setCustomerOptions(data));
        taskBundleService.getTaskBundles().then((data) => setTaskBundleOptions(data));
    }, []);

    useEffect(() => {
        setSelectedCustomer(getCustomerId());
        setSelectedTaskBundle(getTaskBundleId());
    }, [job.customer, job.taskBundle, customerOptions, taskBundleOptions]);

    // Keep staged values in sync with job changes
    useEffect(() => {
        setStagedCustomer(selectedCustomer);
    }, [selectedCustomer]);
    useEffect(() => {
        setStagedTaskBundle(selectedTaskBundle);
    }, [selectedTaskBundle]);

    const handleEditJob = async (data: Partial<Job>): Promise<void> => {
        try {
            const updateJob = await jobService.updateJob(job.id, data);
            if (onJobUpdated) {
                onJobUpdated(updateJob);
            }
            toast.success('Job updated successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to update job');
            throw error;
        }
    };

    const handleCancelJob = async () => {
        try {
            // setIsCanceling(true);
            await jobService.cancelJob(job.id);
            toast.success('Job deleted successfully');
            if (onJobDeleted) {
                onJobDeleted();
            }
            onBack();
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete job');
        } finally {
            // setIsCanceling(false);
            setIsCancelConfirmOpen(false);
        }
    };

    const handleAssign = async (type: 'customer' | 'taskBundle', value: string) => {
        setIsAssigning(true);
        try {
            const payload: { customerId?: string; taskBundleId?: string } = {};
            if (type === 'customer') payload.customerId = value;
            if (type === 'taskBundle') payload.taskBundleId = value;
            const updatedJob = await jobService.assignCustomerOrTaskBundle(job.id, payload);
            toast.success(`${type === 'customer' ? 'Customer' : 'Task Bundle'} assigned successfully`);
            if (onJobUpdated) onJobUpdated(updatedJob);
        } catch (e: any) {
            toast.error(e.message || 'Assignment failed');
        } finally {
            setIsAssigning(false);
        }
    };

    const navigate = useNavigate();

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center mb-6">
                <button
                    onClick={() => onBack()}
                    className="inline-flex items-center mr-4 px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Jobs
                </button>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {job.id}
                </h1>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <Server className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Job Details
                        </h2>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => navigate(`/jobs/${job.id}/edit`)}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2"
                        >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                        </button>

                        { job.status !== 'canceled' && ( 
                        <button
                            onClick={() => setIsCancelConfirmOpen(true)}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            <Ban className="h-4 w-4 mr-1 text-red-500" />
                            Cancel
                        </button>)}
                    </div>
                </div>

                <div className="px-6 py-4">
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                        <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Device</dt>
                            <dd className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                                {'id' in (job.device || {}) ? (
                                    <a href={`/devices/${(job.device as any).id}`} className="hover:underline">
                                        {job.device?.name || job.device?.serialNumber || (job.device as any).id}
                                    </a>
                                ) : (
                                    job.device?.name || job.device?.serialNumber || 'N/A'
                                )}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Customer</dt>
                            <dd className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                                {'id' in (job.customer || {}) ? (
                                    <a href={`/customers/${(job.customer as any).id}`} className="hover:underline">
                                        {job.customer?.shortCode || (job.customer as any).id}
                                    </a>
                                ) : (
                                    job.customer?.shortCode || 'N/A'
                                )}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Job Bundle</dt>
                            <dd className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                                {'id' in (job.taskBundle || {}) ? (
                                    <a href={`/taskbundles/${(job.taskBundle as any).id}`} className="hover:underline">
                                        {job.taskBundle?.name || (job.taskBundle as any).id}
                                    </a>
                                ) : (
                                    job.taskBundle?.name || 'N/A'
                                )}
                            </dd>
                        </div>
   
                        <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{job.status}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Started</dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{new Date(job.createdAt).toLocaleString()}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed</dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{job.completedAt ? new Date(job.completedAt).toLocaleString() : 'N/A'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Connection</dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{job.lastConnection ? new Date(job.lastConnection).toLocaleString() : 'N/A'}</dd>
                        </div>
                    </dl>
                </div>
                
                <JobModal
                    isOpen={isEditModalOpen}
                    onClose={() => {
                    setIsEditModalOpen(false);
                    // Remove /edit from the URL when closing the modal
                    if (editMode) {
                        navigate(`/jobs/${job.id}`, { replace: true });
                    }
                }}
                    onSave={handleEditJob}
                    job={job}
                />

                {isCancelConfirmOpen && (
                    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-full max-w-md">
                            <h3 className="text-lg font-semibold mb-4">Confirm Cancellation</h3>
                            <p className="mb-4">Are you sure you want to cancel this job? This action cannot be undone.</p>
                            <div className="flex justify-end space-x-2">
                                <button
                                    onClick={() => setIsCancelConfirmOpen(false)}
                                    className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCancelJob}
                                    className="px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded hover:bg-red-700 dark:hover:bg-red-400 transition"
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Customer Assignment Card */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg mt-6">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Assign Customer</h2>
                </div>
                <div className="px-6 py-4 flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer</label>
                        <Combobox value={customerOptions.find(c => c.id === stagedCustomer) || null} onChange={val => {
                            if (val) setStagedCustomer(val.id);
                        }} disabled={isAssigning || savingCustomer}>
                            <div className="relative">
                                <ComboboxInput
                                    className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    displayValue={(c: any) => c ? `${c.shortCode} - ${c.name}` : ''}
                                    placeholder="Select customer..."
                                />
                                <ComboboxButton className="group absolute inset-y-0 right-0 px-2.5">
                                    <ChevronDownIcon className="size-4 fill-white/60 group-data-hover:fill-white" />
                                </ComboboxButton>
                                <ComboboxOptions className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                                    {customerOptions.length === 0 && (
                                        <div className="px-4 py-2 text-gray-500">No customers found</div>
                                    )}
                                    {customerOptions.map(c => (
                                        <ComboboxOption
                                            key={c.id}
                                            value={c}
                                            className={({ active }) => `cursor-pointer select-none px-4 py-2 ${active ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-100'}`}
                                        >
                                            {c.shortCode} - {c.name}
                                        </ComboboxOption>
                                    ))}
                                </ComboboxOptions>
                            </div>
                        </Combobox>
                    </div>
                    {stagedCustomer && (
                        <div className="text-sm text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 rounded p-3 border border-gray-200 dark:border-gray-600">
                            {(() => {
                                const c = customerOptions.find(c => c.id === stagedCustomer);
                                if (!c) return null;
                                return <>
                                    <div><span className="font-semibold">Name:</span> {c.name}</div>
                                    <div><span className="font-semibold">Short Code:</span> {c.shortCode}</div>
                                </>;
                            })()}
                        </div>
                    )}
                    <button
                        className="mt-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-400 transition disabled:opacity-50"
                        onClick={async () => {
                            setSavingCustomer(true);
                            await handleAssign('customer', stagedCustomer);
                            setSavingCustomer(false);
                        }}
                        disabled={isAssigning || savingCustomer || stagedCustomer === selectedCustomer}
                    >
                        {savingCustomer ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>

            {/* Task Bundle Assignment Card */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg mt-6">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Assign Task Bundle</h2>
                </div>
                <div className="px-6 py-4 flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Task Bundle</label>
                        <Combobox value={taskBundleOptions.find(tb => tb.id === stagedTaskBundle) || null} onChange={val => {
                            if (val) setStagedTaskBundle(val.id);
                        }} disabled={isAssigning || savingTaskBundle}>
                            <div className="relative">
                                <ComboboxInput
                                    className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    displayValue={(tb: any) => tb ? tb.name : ''}
                                    placeholder="Select task bundle..."
                                />
                                <ComboboxButton className="group absolute inset-y-0 right-0 px-2.5">
                                    <ChevronDownIcon className="size-4 fill-white/60 group-data-hover:fill-white" />
                                </ComboboxButton>
                                <ComboboxOptions className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                                    {taskBundleOptions.length === 0 && (
                                        <div className="px-4 py-2 text-gray-500">No task bundles found</div>
                                    )}
                                    {taskBundleOptions.map(tb => (
                                        <ComboboxOption
                                            key={tb.id}
                                            value={tb}
                                            className={({ active }) => `cursor-pointer select-none px-4 py-2 ${active ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-100'}`}
                                        >
                                            {tb.name}
                                        </ComboboxOption>
                                    ))}
                                </ComboboxOptions>
                            </div>
                        </Combobox>
                    </div>
                    {stagedTaskBundle && (
                        <div className="text-sm text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 rounded p-3 border border-gray-200 dark:border-gray-600">
                            {(() => {
                                const tb = taskBundleOptions.find(tb => tb.id === stagedTaskBundle);
                                if (!tb) return null;
                                return <>
                                    <div><span className="font-semibold">Name:</span> {tb.name}</div>
                                    {tb.description && <div><span className="font-semibold">Description:</span> {tb.description}</div>}
                                </>;
                            })()}
                        </div>
                    )}
                    <button
                        className="mt-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-400 transition disabled:opacity-50"
                        onClick={async () => {
                            setSavingTaskBundle(true);
                            await handleAssign('taskBundle', stagedTaskBundle);
                            setSavingTaskBundle(false);
                        }}
                        disabled={isAssigning || savingTaskBundle || stagedTaskBundle === selectedTaskBundle}
                    >
                        {savingTaskBundle ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
}
