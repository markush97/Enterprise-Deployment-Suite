import { Task } from '../../types/task.interface';
import { EntityFormModal, FieldConfig } from '../utils/EntityFormModal';

interface TaskModalProps {
  task?: Task;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
  loading?: boolean;
}

const taskFields: FieldConfig[] = [
  {
    name: 'name',
    label: 'Task Name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Install Chrome',
  },
  {
    name: 'description',
    label: 'Description',
    type: 'text',
    required: false,
    placeholder: 'Describe what this task does',
  },
  {
    name: 'global',
    label: 'Global',
    type: 'checkbox',
    required: false,
    placeholder: 'true',
    validate: undefined,
  },
];

export function TaskModal({ task, isOpen, onClose, onSave, loading }: TaskModalProps) {
  const initialValues = task
    ? {
        name: task.name,
        description: task.description || '',
        global: task.global || true,
        installScript: task.installScript || '',
      }
    : {
        name: '',
        description: '',
        global: true,
        installScript: '',
      };

  // Improved toggle switch for the global field
  return (
    <EntityFormModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      title={task ? 'Edit Task' : 'Add New Task'}
      fields={taskFields}
      initialValues={initialValues}
      loading={loading}
    />
  );
}
