import { EntityFormModal, FieldConfig } from '../utils/EntityFormModal';
import { Task } from '../../types/task.interface';

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
        type: 'text', // Will be rendered as a checkbox below
        required: false,
        placeholder: '',
        validate: undefined,
    },
    {
        name: 'installScript',
        label: 'Install Script',
        type: 'text',
        required: false,
        placeholder: 'Paste install script here',
    },
];

export function TaskModal({ task, isOpen, onClose, onSave, loading }: TaskModalProps) {
    const initialValues = task ? {
        name: task.name,
        description: task.description || '',
        global: task.global,
        installScript: task.installScript || '',
    } : {
        name: '',
        description: '',
        global: false,
        installScript: '',
    };

    // Custom rendering for the global checkbox
    return (
        <EntityFormModal
            isOpen={isOpen}
            onClose={onClose}
            onSave={onSave}
            title={task ? 'Edit Task' : 'Add New Task'}
            fields={taskFields.map(f =>
                f.name === 'global'
                    ? {
                        ...f, render: (value: boolean, onChange: (v: boolean) => void) => (
                            <label className="flex items-center mb-2">
                                <input
                                    type="checkbox"
                                    checked={!!value}
                                    onChange={e => onChange(e.target.checked)}
                                    className="mr-2"
                                />
                                Global
                            </label>
                        )
                    }
                    : f
            )}
            initialValues={initialValues}
            loading={loading}
        />
    );
}
