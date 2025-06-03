import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { jobService } from '../../services/job.service';
import type { Job } from '../../types/job.interface';
import { ArrowLeft, Ban, CrossIcon, Edit, Loader2, Server, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { JobModal } from './JobModal.component';

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
    const [isCanceling, setIsCanceling] = useState(false);
    const [contentOverviewKey, setContentOverviewKey] = useState(0);
    const [hasContent, setHasContent] = useState<boolean>(false);
    const navigate = useNavigate();

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
            setIsCanceling(true);
            await jobService.cancelJob(job.id);
            toast.success('Job deleted successfully');
            if (onJobDeleted) {
                onJobDeleted();
            }
            onBack();
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete job');
        } finally {
            setIsCanceling(false);
            setIsCancelConfirmOpen(false);
        }
    };

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

                        <button
                            onClick={() => setIsCancelConfirmOpen(true)}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            <Ban className="h-4 w-4 mr-1 text-red-500" />
                            Cancel
                        </button>
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
        </div>
    );
}
