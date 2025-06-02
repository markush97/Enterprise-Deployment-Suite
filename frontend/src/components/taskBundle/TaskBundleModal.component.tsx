import { TaskBundle } from '../../types/taskbundle.interface';
import { EntityFormModal, FieldConfig } from '../utils/EntityFormModal';

interface TaskBundleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<TaskBundle, 'id' | 'createdAt' | 'taskList'>) => Promise<void>;
    loading?: boolean;
    taskBundle?: TaskBundle;
}

const taskFields: FieldConfig[] = [
    {
        name: 'name',
        label: 'Task Name',
        type: 'text',
        required: true,
        placeholder: 'Windows 11 Azure AD Setup',
    },
    {
        name: 'description',
        label: 'Description',
        type: 'text',
        required: false,
        placeholder: 'Describe what this taskbundle does',
    },
    {
        name: 'global',
        label: 'Global',
        type: 'checkbox',
        required: false,
        placeholder: '',
        validate: undefined,
    }
];

export function TaskBundleModal({ taskBundle, isOpen, onClose, onSave, loading }: TaskBundleModalProps) {
    const initialValues = taskBundle ? {
        name: taskBundle.name,
        description: taskBundle.description || '',
        global: taskBundle.global,
    } : {
        name: '',
        description: '',
        global: false
    };

    // Improved toggle switch for the global field
    return (
        <EntityFormModal
            isOpen={isOpen}
            onClose={onClose}
            onSave={onSave}
            title={taskBundle ? 'Edit Task-Bundle' : 'Add New Task-Bundle'}
            fields={taskFields}
            initialValues={initialValues}
            loading={loading}
        />
    );
}

