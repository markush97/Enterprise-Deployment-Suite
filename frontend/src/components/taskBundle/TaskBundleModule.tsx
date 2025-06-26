import { Boxes } from 'lucide-react';
import { Route, Routes, useNavigate, useParams } from 'react-router-dom';

import { useTaskBundles } from '../../hooks/useTaskBundles';
import { DashboardModule } from '../../types/dashboard-module.interface';
import { TaskBundleDetail } from './TaskBundleDetail.component';
import { TaskBundlePage } from './TaskBundlePage.component';

function TaskBundlePageWrapper({ editMode }: { editMode?: boolean } = {}) {
  const navigate = useNavigate();
  const { taskBundleId } = useParams();
  const { taskBundlesQuery, deleteTaskBundleMutation, updateTaskBundleMutation } = useTaskBundles();
  const taskBundle = taskBundlesQuery.data?.find(t => t.id === taskBundleId);

  if (!taskBundle) return <div className="text-center py-8">Taskbundle not found</div>;

  const handleTaskBundleUpdated = async (updatedTask: typeof taskBundle) => {
    await updateTaskBundleMutation.mutateAsync({ id: taskBundle?.id, data: updatedTask });
  };

  const handleTaskBundleDeleted = async () => {
    await deleteTaskBundleMutation.mutateAsync(taskBundle.id);
  };

  return (
    <TaskBundleDetail
      taskBundle={taskBundle}
      onBack={() => navigate('/taskbundle')}
      onTaskBundleDeleted={handleTaskBundleDeleted}
      onTaskBundleUpdated={handleTaskBundleUpdated}
      editMode={editMode}
    />
  );
}

export function TaskBundleModuleRoutes() {
  return (
    <Routes>
      <Route index element={<TaskBundlePage />} />
      <Route path=":taskBundleId" element={<TaskBundlePageWrapper />} />
      <Route path=":taskBundleId/edit" element={<TaskBundlePageWrapper editMode={true} />} />
    </Routes>
  );
}

export const TaskBundleModule: DashboardModule = {
  route: '/taskbundles',
  label: 'Task Bundles',
  icon: <Boxes className="h-4 w-4 mr-2" />,
  Component: TaskBundleModuleRoutes,
};
