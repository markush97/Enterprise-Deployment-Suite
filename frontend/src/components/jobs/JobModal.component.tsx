import { useState, useEffect } from 'react';
import { EntityFormModal, FieldConfig } from '../utils/EntityFormModal';
import type { Job } from '../../types/job.interface';

interface JobModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<Job, 'id' | 'createdAt'>) => Promise<void>;
    loading?: boolean;
    job?: Job;
}

const jobFields: FieldConfig[] = [
    {
        name: 'deviceName',
        label: 'Device Name',
        type: 'text',
        required: false,
        placeholder: 'Device name',
    },
    {
        name: 'status',
        label: 'Status',
        type: 'text',
        required: true,
        placeholder: 'Status',
    },
    // Add more fields as needed
];

export function JobModal({ job, isOpen, onClose, onSave, loading }: JobModalProps) {
    const [deviceName, setDeviceName] = useState(job?.device?.name || '');
    const [status, setStatus] = useState(job?.status || '');

    useEffect(() => {
        setDeviceName(job?.device?.name || '');
        setStatus(job?.status || '');
    }, [job]);

    const handleSave = async (data: any) => {
        await onSave({
            ...data,
            device: { name: deviceName },
            status,
        });
    };

    return (
        <EntityFormModal
            isOpen={isOpen}
            onClose={onClose}
            onSave={handleSave}
            title={job ? 'Edit Job' : 'Add New Job'}
            fields={jobFields}
            initialValues={{
                deviceName,
                status,
            }}
            loading={loading}
        />
    );
}
