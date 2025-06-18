import { useNavigate } from 'react-router-dom';
import { jobService } from '../../services/job.service';
import type { Job } from '../../types/job.interface';
import { AlertCircle, ArrowLeft, Ban, CheckCircle, Edit, HelpCircle, Loader2, Server, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { JobModal } from './JobModal.component';
import { customerService } from '../../services/customer.service';
import { taskBundleService } from '../../services/taskbundle.service';
import { AssignCustomerCard } from './AssignCustomerCard.component';
import { AssignTaskBundleCard } from './AssignTaskBundleCard.component';
import { Task } from '../../types/task.interface';
import Tippy from '@tippyjs/react';
import { DeviceNameCard } from './DeviceNameCard.component';

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
    const [taskBundleOptions, setTaskBundleOptions] = useState<{ id: string; name: string; description?: string; taskList?: Task[] }[]>([]);
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

    function getStatusIcon(status: Job['status']) {
        switch (status) {
            case 'preparing':
            case 'imaging':
            case 'pxe_selection':
            case 'installing':
            case 'starting':
            case 'verifying':
                return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
            case 'ready':
                return <AlertCircle className="h-5 w-5 text-yellow-500" />;
            case 'done':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'waiting_for_instructions':
                return <HelpCircle className="h-5 w-5 text-gray-500" />;
            case 'canceled':
                return <XCircle className="h-5 w-5 text-red-500" />;
            default:
                return <XCircle className="h-5 w-5 text-red-500" />;
        }
    }

    function getStatusColor(status: Job['status']) {
        switch (status) {
            case 'preparing':
            case 'imaging':
            case 'pxe_selection':
            case 'waiting_for_instructions':
                return 'text-yellow-600 dark:text-yellow-400';
            case 'verifying':
            case 'starting':
            case 'installing':
                return 'text-blue-600 dark:text-blue-400';
            case 'ready':
                return 'text-yellow-600 dark:text-yellow-400';
            case 'done':
                return 'text-green-600 dark:text-green-400';
            default:
                return 'text-red-600 dark:text-red-400';
        }
    }

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

    // Fetch full task bundle details when stagedTaskBundle changes
    useEffect(() => {
        if (!stagedTaskBundle) return;
        taskBundleService.getTaskBundle(stagedTaskBundle).then(tb => {
            setTaskBundleOptions(prev => {
                // Replace or add the updated bundle in the options
                const others = prev.filter(b => b.id !== tb.id);
                return [...others, tb];
            });
        });
    }, [stagedTaskBundle]);

    const [showStartConfirm, setShowStartConfirm] = useState(false);
    const [isStarting, setIsStarting] = useState(false);

    // Determine if job is started (not waiting for instructions)
    const isJobStarted = job.status !== 'waiting_for_instructions';

    // When the job's customer changes, refresh the device name generator (autoName) instantly
    useEffect(() => {
        setDeviceNameCardKey(prev => prev + 1);
    }, [job.customer?.id]);

    // When the job is started, instantly refresh the job status from the backend
    useEffect(() => {
        if (job.status === 'starting') {
            let interval: ReturnType<typeof setInterval>;
            const pollStatus = async () => {
                try {
                    const updated = await jobService.getJob(job.id);
                    if (updated.status !== 'starting' && onJobUpdated) {
                        onJobUpdated(updated);
                        clearInterval(interval);
                    } else if (updated.status !== job.status && onJobUpdated) {
                        // If status changed for any reason, update
                        onJobUpdated(updated);
                    }
                } catch {}
            };
            interval = setInterval(pollStatus, 1500);
            return () => clearInterval(interval);
        }
    }, [job.status, job.id, onJobUpdated]);

    // Add a key to DeviceNameCard to force re-mount on customer change
    const [deviceNameCardKey, setDeviceNameCardKey] = useState(0);

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
                    {job?.name ?? job.id}
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

                        {job.status !== 'canceled' && (
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
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Device Type</dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                {(job.device && 'type' in job.device) ? (job.device as any).type : 'N/A'}
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
                            <dd className="flex items-center space-x-2">
                                {getStatusIcon(job.status)}
                                <span className={`text-sm font-medium ${getStatusColor(job.status)}`}>
                                    {job.status.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                </span>
                            </dd>
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

            {/* Start Job Button */}
            {!isJobStarted && (
                <div className="flex justify-center my-8">
                    <Tippy
                        content={(!job.customer || !job.taskBundle) ? 'Assign both a customer and a task bundle before starting the job.' : ''}
                        disabled={!!job.customer && !!job.taskBundle}
                        placement="top"
                    >
                        <div>
                            <button
                                className="px-8 py-4 text-lg font-bold rounded bg-green-600 hover:bg-green-700 text-white shadow-lg transition focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 disabled:opacity-60"
                                onClick={() => setShowStartConfirm(true)}
                                disabled={isStarting || !job.customer || !job.taskBundle}
                            >
                                {isStarting ? 'Starting...' : 'Start Job'}
                            </button>
                        </div>
                    </Tippy>
                </div>
            )}
            {/* Start Confirmation Dialog */}
            {showStartConfirm && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-60 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-900 p-8 rounded shadow-lg w-full max-w-lg">
                        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Start Job?</h3>
                        <p className="mb-4 text-gray-700 dark:text-gray-200">
                            Are you sure you want to start this job? <br />
                            <span className="font-semibold text-red-600 dark:text-red-400">After starting, changes to the customer or task bundle are no longer possible.</span>
                        </p>
                        <div className="mb-4 space-y-2">
                            <div><span className="font-semibold">Task Bundle:</span> {job.taskBundle?.name || (job.taskBundle as any)?.name || 'N/A'}</div>
                            <div><span className="font-semibold">Customer:</span> {job.customer?.shortCode || (job.customer as any)?.shortCode || job.customer?.name || (job.customer as any)?.name || 'N/A'}</div>
                            <div><span className="font-semibold">Device:</span> {job.device?.name || job.device?.serialNumber || (job.device as any)?.name || (job.device as any)?.serialNumber || 'N/A'}</div>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button
                                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition"
                                onClick={() => setShowStartConfirm(false)}
                                disabled={isStarting}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded hover:bg-green-700 dark:hover:bg-green-400 transition"
                                onClick={async () => {
                                    setIsStarting(true);
                                    try {
                                        await jobService.startJob(job.id);
                                        toast.success('Job started');
                                        setShowStartConfirm(false);
                                        if (onJobUpdated) onJobUpdated({ ...job, status: 'starting' });
                                    } catch (e: any) {
                                        toast.error(e.message || 'Failed to start job');
                                    } finally {
                                        setIsStarting(false);
                                    }
                                }}
                                disabled={isStarting}
                            >
                                Yes, Start Job
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Device Name Card (moved above assignment cards) */}
            <DeviceNameCard
                key={deviceNameCardKey}
                job={job}
                isJobStarted={isJobStarted}
                onJobUpdated={onJobUpdated}
                customerOptions={customerOptions}
            />

            {/* Customer Assignment Card */}
            <AssignCustomerCard
                customerOptions={customerOptions}
                stagedCustomer={stagedCustomer}
                setStagedCustomer={setStagedCustomer}
                isAssigning={isAssigning || isJobStarted}
                selectedCustomer={selectedCustomer}
                handleAssign={handleAssign}
                tooltip={isJobStarted ? 'Customer cannot be changed after the job has started.' : undefined}
                savingCustomer={false}
            />

            {/* Task Bundle Assignment Card */}
            <AssignTaskBundleCard
                taskBundleOptions={taskBundleOptions}
                stagedTaskBundle={stagedTaskBundle}
                setStagedTaskBundle={setStagedTaskBundle}
                isAssigning={isAssigning || isJobStarted}
                savingTaskBundle={false}
                selectedTaskBundle={selectedTaskBundle}
                handleAssign={handleAssign}
                tooltip={isJobStarted ? 'Task bundle cannot be changed after the job has started.' : undefined}
            />
        </div>
    );
}
