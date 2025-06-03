import { useEffect, useState } from 'react';
import { useCustomers } from '../../hooks/useCustomers';
import { TaskBundle } from '../../types/task.interface';
import toast from 'react-hot-toast';

export function CustomerAssignmentCard({ taskBundle }: { taskBundle: TaskBundle & { customers?: { id: string }[] } }) {
    const { customersQuery } = useCustomers();

    const initialIds = taskBundle.customerIds && taskBundle.customerIds.length > 0
        ? taskBundle.customerIds
        : (taskBundle.customers ? taskBundle.customers.map(c => c.id) : []);
    const [isEditing, setIsEditing] = useState(false);
    const [assignedIds, setAssignedIds] = useState<string[]>(initialIds);
    const [saving, setSaving] = useState(false);
    const customers = (customersQuery.data || []).slice().sort((a, b) => a.shortCode.localeCompare(b.shortCode));

    useEffect(() => {
        setAssignedIds(
            taskBundle.customerIds && taskBundle.customerIds.length > 0
                ? taskBundle.customerIds
                : (taskBundle.customers ? taskBundle.customers.map(c => c.id) : [])
        );
        setIsEditing(false);
    }, [taskBundle.customerIds, taskBundle.customers]);

    if (taskBundle.global) {
        return (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg px-6 py-4 mb-4">
                <div className="font-semibold text-gray-900 dark:text-white mb-2">Assigned Customers</div>
                <div className="text-gray-600 dark:text-gray-300">Cannot assign customers since this bundle is global. Every customer can use global bundles.</div>
            </div>
        );
    }

    const handleToggle = (id: string) => {
        setAssignedIds(ids => {
            const changed = ids.includes(id) ? ids.filter(cid => cid !== id) : [...ids, id];
            setIsEditing(true);
            return changed;
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Save to backend (patch bundle)
            await import('../../services/taskbundle.service').then(({ taskBundleService }) =>
                taskBundleService.updateTaskBundle(taskBundle.id, { customerIds: assignedIds })
            );
            setIsEditing(false);
            toast.success('Customer assignment updated');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg px-6 py-4 mb-4">
            <div className="font-semibold text-gray-900 dark:text-white mb-2">Assigned Customers</div>
            {customers.length === 0 ? (
                <div className="text-gray-500 dark:text-gray-400">No customers found.</div>
            ) : (
                <div className="max-h-64 overflow-y-auto border rounded p-2 bg-gray-50 dark:bg-gray-700">
                    {customers.map((customer) => (
                        <label key={customer.id} className="flex items-center gap-2 mb-1 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={assignedIds.includes(customer.id)}
                                onChange={() => handleToggle(customer.id)}
                                disabled={saving}
                            />
                            <span className="font-mono text-sm text-gray-800 dark:text-gray-200 w-24 truncate">{customer.shortCode}</span>
                            <span className="text-gray-700 dark:text-gray-300 truncate flex-1">{customer.name}</span>
                        </label>
                    ))}
                </div>
            )}
            <div className="flex justify-end mt-2">
                {isEditing && (
                    <button
                        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                )}
            </div>
        </div>
    );
}
