import { Clock, CheckCircle, AlertCircle, Loader2, XCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { jobService } from '../../services/job.service';
import type { Job } from '../../types/job.type';

export function JobsList() {
    const {
      data: jobs = [],
      isLoading,
      isError,
      error
    } = useQuery<Job[]>({
      queryKey: ['jobs'],
      queryFn: jobService.getJobs,
      refetchInterval: 5000 // Refresh every 5 seconds
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-red-500">
                <AlertCircle className="h-12 w-12 mb-4" />
                <p>{error instanceof Error ? error.message : 'Failed to load jobs'}</p>
            </div>
        );
    }

    if (jobs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No recent jobs</p>
            </div>
        );
    }

    const getStatusIcon = (status: Job['status']) => {
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
            default:
                return <XCircle className="h-5 w-5 text-red-500" />;
        }
    };

    const getStatusColor = (status: Job['status']) => {
        switch (status) {
            case 'preparing':
            case 'imaging':
            case 'pxe_selection':
            case 'installing':
            case 'verifying':
                return 'text-blue-600 dark:text-blue-400';
            case 'ready':
                return 'text-yellow-600 dark:text-yellow-400';
            case 'done':
                return 'text-green-600 dark:text-green-400';
            default:
                return 'text-red-600 dark:text-red-400';
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Device</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Image</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Started</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {jobs.map((job: Job) => (
                        <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                {job.device?.name || job.device?.serialNumber || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {job?.customer.shortCode || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {job.imageName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {new Date(job.createdAt).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                    {getStatusIcon(job.status)}
                                    <span className={`text-sm font-medium ${getStatusColor(job.status)}`}>
                                        {job.status.split('_').map((word: string) =>
                                            word.charAt(0).toUpperCase() + word.slice(1)
                                        ).join(' ')}
                                    </span>
                                </div>
                                {job.completedAt && (
                                    <p className="mt-1 text-sm text-gray-500">
                                        Completed: {new Date(job.completedAt).toLocaleDateString()}
                                    </p>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
