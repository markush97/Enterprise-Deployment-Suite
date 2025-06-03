import { Clock, CheckCircle, AlertCircle, Loader2, XCircle, HelpCircle } from 'lucide-react';
import { useJobs } from '../../hooks/useJobs';
import { EntityList } from '../utils/EntityList';
import type { Job } from '../../types/job.interface';

export function JobsList() {
    const { data: jobs = [], isLoading, isError, error } = useJobs();

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
            label: 'Started',
            render: (job: Job) => new Date(job.createdAt).toLocaleString(),
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

    const actions = [
        {
            label: 'Edit',
            onClick: () => {
                // TODO: Implement edit job modal or navigation
            },
        },
        {
            label: 'Cancel',
            danger: true,
            onClick: () => {
                // TODO: Implement cancel job logic
            },
        },
        {
            label: 'Assign Task Bundle',
            onClick: () => {
                // TODO: Implement assign task bundle logic
            },
            disabled: (job: Job) => !job.customer?.shortCode,
            tooltip: (job: Job) => !job.customer?.shortCode ? 'Assign a customer first' : undefined,
        },
        {
            label: 'Assign Customer',
            onClick: () => {
                // TODO: Implement assign customer logic
            },
        },
    ];

    function getStatusIcon(status: Job['status']) {
        switch (status) {
            case 'preparing':
            case 'imaging':
            case 'pxe_selection':
            case 'installing':
            case 'verifying':
                return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
            case 'ready':
                return <AlertCircle className="h-5 w-5 text-yellow-500" />;
            case 'done':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'waiting_for_instructions':
                return <HelpCircle className="h-5 w-5 text-gray-500" />;
            default:
                return <XCircle className="h-5 w-5 text-red-500" />;
        }
    }

    function getStatusColor(status: Job['status']) {
        switch (status) {
            case 'preparing':
            case 'imaging':
            case 'pxe_selection':
            case 'installing':
            case 'waiting_for_instructions':
                return 'text-yellow-600 dark:text-yellow-400';
            case 'verifying':
                return 'text-blue-600 dark:text-blue-400';
            case 'ready':
                return 'text-yellow-600 dark:text-yellow-400';
            case 'done':
                return 'text-green-600 dark:text-green-400';
            default:
                return 'text-red-600 dark:text-red-400';
        }
    }

    return (
        <EntityList
            data={jobs}
            columns={columns}
            actions={actions}
            isLoading={isLoading}
            isError={isError}
            error={error instanceof Error ? error.message : undefined}
            title={<span>Jobs</span>}
            emptyState={<span className="text-gray-500 dark:text-gray-400">No recent jobs</span>}
        />
    );
}
