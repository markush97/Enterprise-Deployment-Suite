import React, { useState } from 'react';
import { Play, Clock } from 'lucide-react';
import { JobsList } from './jobs/JobsList';
import { toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

export function JobsPage() {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleJobStarted = () => {
    setIsWizardOpen(false);
    queryClient.invalidateQueries({ queryKey: ['jobs'] });
    toast.success('Job started successfully');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Clock className="h-8 w-8 text-gray-500 dark:text-gray-400" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Jobs</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage and monitor imaging jobs</p>
              </div>
            </div>
            <button
              onClick={() => setIsWizardOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Play className="h-4 w-4 mr-2" />
              Start New Job
            </button>
          </div>
        </div>
      </div>

      {/* Recent Jobs */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Jobs</h2>
        </div>
        <div className="p-6">
          <JobsList />
        </div>
      </div>

      {/* Device Imaging Wizard Modal */}
      {/*<DeviceImagingWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onJobStarted={handleJobStarted}
      />*/}
    </div>
  );
}
