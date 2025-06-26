import { Check, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useQueryClient } from '@tanstack/react-query';

import { useTaskBundles } from '../../hooks/useTaskBundles';
import { useTasks } from '../../hooks/useTasks';
import { taskBundleService } from '../../services/taskbundle.service';
import { Task } from '../../types/task.interface';
import { ConfirmDeleteModal } from '../utils/ConfirmDeleteModal';
import { EntityList } from '../utils/EntityList';
import { TaskModal } from './TaskModal.component';

export function TaskList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [showAddToBundle, setShowAddToBundle] = useState(false);
  const [addToBundleTask, setAddToBundleTask] = useState<Task | null>(null);
  const [selectedBundleId, setSelectedBundleId] = useState<string | null>(null);
  const [isAddingToBundle, setIsAddingToBundle] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { tasksQuery, addTaskMutation, updateTaskMutation, deleteTaskMutation } = useTasks();
  const { taskBundlesQuery } = useTaskBundles();

  const { data: tasks = [], isLoading, isError, error } = tasksQuery;

  // Handle add/edit submit
  const handleSubmit = async (data: Omit<Task, 'id' | 'createdAt'>) => {
    if (selectedTask) {
      await updateTaskMutation.mutateAsync({ id: selectedTask.id, data });
    } else {
      await addTaskMutation.mutateAsync(data);
    }
    queryClient.invalidateQueries({ queryKey: ['taskBundles'] });
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const handleDelete = (task: Task) => {
    setTaskToDelete(task);
  };
  const confirmDelete = () => {
    if (taskToDelete) {
      deleteTaskMutation.mutate(taskToDelete.id);
      setTaskToDelete(null);
    }
  };
  const cancelDelete = () => {
    setTaskToDelete(null);
  };

  // Add to Bundle logic
  const handleAddToBundle = (task: Task) => {
    setAddToBundleTask(task);
    setShowAddToBundle(true);
    setSelectedBundleId(null);
  };
  const handleConfirmAddToBundle = async () => {
    if (!addToBundleTask || !selectedBundleId) return;
    setIsAddingToBundle(true);
    try {
      await taskBundleService.addTaskToBundle(selectedBundleId, addToBundleTask.id);
      setShowAddToBundle(false);
      setAddToBundleTask(null);
      setSelectedBundleId(null);
      queryClient.invalidateQueries({ queryKey: ['taskBundles'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    } finally {
      setIsAddingToBundle(false);
    }
  };

  // Only show bundles that do not already contain the task and are compatible about customers assigned or global status
  const compatibleBundles = taskBundlesQuery.data || [];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Tasks</h2>
        <button
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => {
            setIsModalOpen(true);
            setSelectedTask(null);
          }}
        >
          <Plus className="h-4 w-4 mr-1" /> Add Task
        </button>
      </div>
      <EntityList<Task>
        data={tasks}
        columns={[
          { label: 'Name', render: task => task.name },
          { label: 'Description', render: task => task.description },
          { label: 'Global', render: task => (task.global ? <Check /> : <X />) },
          { label: 'BuiltIn', render: task => (task.builtIn ? <Check /> : <X />) },
        ]}
        actions={[
          {
            label: 'Edit',
            onClick: task => {
              setIsModalOpen(true);
              setSelectedTask(task);
            },
          },
          {
            label: 'Add to Bundle',
            onClick: handleAddToBundle,
          },
          {
            label: 'Delete',
            onClick: handleDelete,
            danger: true,
          },
        ]}
        isLoading={isLoading}
        isError={isError}
        error={error ? (error as Error).message : undefined}
        onRowClick={task => navigate(`/tasks/${task.id}`)}
      />
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
        }}
        onSave={handleSubmit}
        task={selectedTask || undefined}
      />
      <ConfirmDeleteModal
        isOpen={!!taskToDelete}
        title="Delete Task"
        entityName={taskToDelete?.name || ''}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />
      {/* Add to Bundle Modal */}
      {showAddToBundle && (
        <div className="fixed z-50 inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6 z-50 relative">
            <div className="text-lg font-bold mb-2">Add Task to Bundle</div>
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium">Select a compatible bundle:</label>
              <select
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                value={selectedBundleId || ''}
                onChange={e => setSelectedBundleId(e.target.value)}
                disabled={isAddingToBundle}
              >
                <option value="" disabled>
                  Select bundle...
                </option>
                {compatibleBundles.map(bundle => (
                  <option key={bundle.id} value={bundle.id}>
                    {bundle.name}
                  </option>
                ))}
              </select>
              {compatibleBundles.length === 0 && (
                <div className="text-sm text-gray-500 mt-2">No compatible bundles available.</div>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={() => setShowAddToBundle(false)}
                disabled={isAddingToBundle}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                onClick={handleConfirmAddToBundle}
                disabled={!selectedBundleId || isAddingToBundle || compatibleBundles.length === 0}
              >
                {isAddingToBundle ? 'Adding...' : 'Add to Bundle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
