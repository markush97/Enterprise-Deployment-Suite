import { Cpu } from 'lucide-react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';

import { useTasks } from '../../hooks/useTasks';
import { DashboardModule } from '../../types/dashboard-module.interface';
import { TaskDetail } from './TaskDetail.component';
import { TaskPage } from './TaskPage.component';

function TaskPageWrapper({ editMode }: { editMode?: boolean } = {}) {
  const navigate = useNavigate();
  const { taskid } = useParams();
  const { tasksQuery, updateTaskMutation, deleteTaskMutation } = useTasks();
  const task = tasksQuery.data?.find(t => t.id === taskid);

  if (!task) return <div className="text-center py-8">Task not found</div>;

  const handleTaskUpdated = async (updatedTask: typeof task) => {
    await updateTaskMutation.mutateAsync({ id: task.id, data: updatedTask });
  };

  const deleteTaskUpdates = async () => {
    await deleteTaskMutation.mutateAsync(task.id);
  };

  return (
    <TaskDetail
      task={task}
      onBack={() => navigate('/tasks')}
      onTaskUpdated={handleTaskUpdated}
      onTaskDeleted={deleteTaskUpdates}
      editMode={editMode}
    />
  );
}

export function TasksModuleRoutes() {
  return (
    <Routes>
      <Route index element={<TaskPage />} />
      <Route path=":taskid" element={<TaskPageWrapper />} />
      <Route path=":taskid/edit" element={<TaskPageWrapper editMode={true} />} />
    </Routes>
  );
}

export const TasksModule: DashboardModule = {
  route: '/tasks',
  label: 'Tasks',
  icon: <Cpu className="h-4 w-4 mr-2" />,
  Component: TasksModuleRoutes,
};
