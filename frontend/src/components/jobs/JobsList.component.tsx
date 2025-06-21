import { CheckCircle, AlertCircle, Loader2, XCircle, HelpCircle } from 'lucide-react';
import { useJobs } from '../../hooks/useJobs';
import { EntityList, EntityListAction } from '../utils/EntityList';
import type { Job } from '../../types/job.interface';
import { JobModal } from './JobModal.component';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfirmDeleteModal } from '../utils/ConfirmDeleteModal';

export function JobsList() {
    const { jobsQuery, addJobMutation, cancelJobMutation, updateJobMutation } = useJobs();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [jobToCancel, setJobToCancel] = useState<Job | null>(null);
    const navigate = useNavigate();


    // Handle add/edit submit
    const handleSubmit = async (data: Omit<Job, 'id' | 'createdAt'>) => {
        if (selectedJob) {
            await updateJobMutation.mutateAsync({ id: selectedJob.id, data });
        } else {
            await addJobMutation.mutateAsync(data);
        }
        setIsModalOpen(false);
        setSelectedJob(null);
    };

    const handleCancel = (job: Job) => {
        setJobToCancel(job);
    };
    const confirmCancel = () => {
        if (jobToCancel) {
            cancelJobMutation.mutate(jobToCancel.id);
            setJobToCancel(null);
        }
    };
    const cancelCancel = () => {
        setJobToCancel(null);
    };

    const { data: jobs = [], isLoading, isError, error } = jobsQuery;

    function formatRelativeTime(dateString: string) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        if (diffHours < 1) {
            const diffMinutes = Math.round(diffMs / (1000 * 60));
            return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
        } else if (diffHours < 18) {
            const roundedHours = Math.round(diffHours);
            return `${roundedHours} hour${roundedHours !== 1 ? 's' : ''} ago`;
        } else {
            const diffDays = Math.round(diffHours / 24);
            return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        }
    }

    const columns = [
        {
            label: 'Name',
            render: (job: Job) => job?.name || job.id || 'N/A',
        },
        {
            label: 'Device',
            render: (job: Job) => job.device?.name || job.device?.serialNumber || 'N/A',
        },
        {
            label: 'Customer',
            render: (job: Job) => job.customer?.shortCode || 'N/A',
        },
        {
            label: 'Task Bundle',
            render: (job: Job) => job.taskBundle?.name || 'N/A',
        },
        {
            label: 'Last Connection',
            render: (job: Job) => formatRelativeTime(job.lastConnection),
        },
        {
            label: 'Status',
            render: (job: Job) => (
                <div className="flex items-center space-x-2">
                    {getStatusIcon(job.status)}
                    <span className={`text-sm font-medium ${getStatusColor(job.status)}`}>
                        {job.status.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                    {job.completedAt && (
                        <p className="mt-1 text-xs text-gray-500">Completed: {formatRelativeTime(job.completedAt)}</p>
                    )}
                </div>
            ),
        },
    ];

    const actions: EntityListAction<Job>[] = [
        {
            label: 'Edit',
            onClick: (job) => {setIsModalOpen(true); setSelectedJob(job); },
        },
        {
            label: 'Cancel',
            danger: true,
            onClick: handleCancel,
            disabled: (job: Job) => job.status === 'canceled' || job.status === 'done',
            tooltip: 'Cancel this job',
        }
    ];

    function getStatusIcon(status: Job['status']) {
        switch (status) {
            case 'preparing':
            case 'imaging':
            case 'pxe_selection':
            case 'installing':
            case 'verifying':
            case 'starting':
                return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
            case 'ready':
                return <AlertCircle className="h-5 w-5 text-yellow-500" />;
            case 'done':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'waiting_for_instructions':
                return <HelpCircle className="h-5 w-5 text-gray-500" />;
            case 'canceled':
                return <XCircle className="h-5 w-5 text-red-500" />;
            case 'timeout':
            case 'timout':
                return <AlertCircle className="h-5 w-5 text-orange-500" />;
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
            case 'timeout':
            case 'timout':
                return 'text-orange-600 dark:text-orange-400';
            default:
                return 'text-red-600 dark:text-red-400';
        }
    }
    return (
        <>
            <EntityList<Job>
                data={jobs}
                columns={columns}
                actions={actions}
                isLoading={isLoading}
                isError={isError}
                error={error instanceof Error ? error.message : undefined}
                emptyState={<span className="text-gray-500 dark:text-gray-400">No recent jobs</span>}
                onRowClick={(job) => navigate(`/jobs/${job.id}`)}
            />
            <JobModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelectedJob(null); }}
                onSave={handleSubmit}
                job={selectedJob || undefined}
            />
            <ConfirmDeleteModal
                isOpen={!!jobToCancel}
                title="Cancel Job"
                entityName={jobToCancel?.device.name || ''}
                onCancel={cancelCancel}
                onConfirm={confirmCancel}
            />
        </>
    );
}
