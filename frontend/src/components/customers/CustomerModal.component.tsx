import { EntityFormModal, FieldConfig } from '../utils/EntityFormModal';
import { Customer } from '../../types/customer.interface';

interface CustomerModalProps {
    customer?: Customer;
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<Customer, 'id' | 'createdAt'>) => Promise<void>;
    loading?: boolean;
}

const customerFields: FieldConfig[] = [
    {
        name: 'name',
        label: 'Customer Name',
        type: 'text',
        required: true,
        placeholder: 'e.g. Acme Corporation',
    },
    {
        name: 'shortCode',
        label: 'Short Code',
        type: 'text',
        required: true,
        placeholder: '3-8 uppercase letters/numbers',
        pattern: /^[A-Z0-9]{3,8}$/,
        validate: (v) => !/^[A-Z0-9]{3,8}$/.test(v) ? 'Short code must be 3-8 uppercase letters/numbers' : null,
    },
    {
        name: 'rmmId',
        label: 'Pulseway ID',
        type: 'number',
        required: true,
        placeholder: 'e.g. 1234',
        validate: (v) => !v ? 'Pulseway ID is required' : null,
    },
    {
        name: 'zohoId',
        label: 'Zoho ID',
        type: 'number',
        placeholder: 'e.g. 155899000000360493',
    },
    {
        name: 'itGlueId',
        label: 'IT-Glue ID',
        type: 'number',
        placeholder: 'e.g. 3980381753180365',
    },
];

export function CustomerModal({ customer, isOpen, onClose, onSave, loading }: CustomerModalProps) {
    const initialValues = customer ? {
        name: customer.name,
        shortCode: customer.shortCode,
        rmmId: customer.rmmId,
        zohoId: customer.zohoId,
        itGlueId: customer.itGlueId,
    } : {
        name: '',
        shortCode: '',
        rmmId: 0,
        zohoId: 0,
        itGlueId: 0,
    };

    // Custom validation for uniqueness or other async errors can be handled in onSave
    return (
        <EntityFormModal
            isOpen={isOpen}
            onClose={onClose}
            onSave={onSave}
            title={customer ? 'Edit Customer' : 'Add New Customer'}
            fields={customerFields}
            initialValues={initialValues}
            loading={loading}
        />
    );
}
