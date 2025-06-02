import { TaskBundle } from '../../types/taskbundle.interface';
import { EntityFormModal, FieldConfig } from '../utils/EntityFormModal';
import { useCustomers } from '../../hooks/useCustomers';
import { useEffect, useState } from 'react';
import Tippy from '@tippyjs/react';

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
    },
    // The customer assignment will be handled in the modal body, not as a FieldConfig
];

export function TaskBundleModal({ taskBundle, isOpen, onClose, onSave, loading }: TaskBundleModalProps) {
    const [selectedCustomers, setSelectedCustomers] = useState<string[]>(taskBundle?.customerIds || []);
    const [global, setGlobal] = useState(taskBundle?.global || false);

    useEffect(() => {
        setSelectedCustomers(taskBundle?.customerIds || []);
        setGlobal(taskBundle?.global || false);
    }, [taskBundle]);

    const handleSave = async (data: any) => {
        await onSave({ ...data, customerIds: global ? [] : selectedCustomers, global });
    };

    return (
        <>

            <EntityFormModal
                isOpen={isOpen}
                onClose={onClose}
                onSave={handleSave}
                title={taskBundle ? 'Edit Task-Bundle' : 'Add New Task-Bundle'}
                fields={taskFields}
                initialValues={{
                    name: taskBundle?.name || '',
                    description: taskBundle?.description || '',
                    global: global,
                }}
                loading={loading}
            />

        </>
    );
}

