import { Server } from 'lucide-react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';

import { useJobs } from '../../hooks/useJobs';
import { DashboardModule } from '../../types/dashboard-module.interface';
import { JobDetail } from './JobDetail.component';
import { JobsList } from './JobsList.component';

function JobPageWrapper({ editMode }: { editMode?: boolean } = {}) {
  const navigate = useNavigate();
  const { jobid } = useParams();
  const { jobsQuery, deleteJobMutation, updateJobMutation } = useJobs();
  const job = jobsQuery.data?.find(j => j.id === jobid);

  if (!job) return <div className="text-center py-8">Job not found</div>;

  const handleJobUpdated = async (updatedJob: typeof job) => {
    await updateJobMutation.mutateAsync({ id: job.id, data: updatedJob });
  };
  const deleteJob = async () => {
    await deleteJobMutation.mutateAsync(job.id);
  };

  return (
    <JobDetail
      job={job}
      onBack={() => navigate('/jobs')}
      onJobUpdated={handleJobUpdated}
      onJobDeleted={deleteJob}
      editMode={editMode}
    />
  );
}

export function JobsModuleRoutes() {
  return (
    <Routes>
      <Route index element={<JobsList />} />
      <Route path=":jobid" element={<JobPageWrapper />} />
      <Route path=":jobid/edit" element={<JobPageWrapper editMode={true} />} />
    </Routes>
  );
}

export const JobsModule: DashboardModule = {
  route: '/jobs',
  label: 'Jobs',
  icon: <Server className="h-4 w-4 mr-2" />,
  Component: JobsModuleRoutes,
};
