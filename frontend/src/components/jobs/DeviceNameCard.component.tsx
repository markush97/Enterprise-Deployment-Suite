import { useState, useEffect } from 'react';
import { deviceService } from '../../services/device.service';
import { customerService } from '../../services/customer.service';
import toast from 'react-hot-toast';
import type { Job } from '../../types/job.interface';
import Tippy from '@tippyjs/react';

interface DeviceNameCardProps {
    job: Job;
    isJobStarted: boolean;
    onJobUpdated?: (job: Job) => void;
    customerOptions?: { id: string; name: string; shortCode: string }[];
}

export function DeviceNameCard({
    job,
    isJobStarted,
    onJobUpdated,
    customerOptions = [],
}: DeviceNameCardProps) {
    // Helper to get deviceId for API call
    const deviceId = job.device?.id;
    const [deviceName, setDeviceName] = useState(job.device?.name || '');
    const [autoName, setAutoName] = useState('');
    const [autoNameLoading, setAutoNameLoading] = useState(false);
    const [usedAutoName, setUsedAutoName] = useState(false);

    // Track selected device type for auto-naming
    const [selectedType, setSelectedType] = useState(job.device?.type || '');

    useEffect(() => {
        setDeviceName(job.device?.name || '');
        setSelectedType(job.device?.type || '');
        setAutoName('');
    }, [job.device]);

    // Use next device number from customer object if available
    const customerId = job.customer?.id;
    const customer = customerId ? (Array.isArray(job.customer) ? job.customer.find((c: any) => c.id === customerId) : job.customer) : undefined;

    // Dynamically update autoName when selectedType or customer changes
    useEffect(() => {
        const updateAutoName = async () => {
            if (!customerId || !selectedType) {
                setAutoName('');
                return;
            }
            setAutoNameLoading(true);
            try {
                let nextNumber: number | undefined;
                let typeKey = '';
                switch (selectedType) {
                    case 'PC': typeKey = 'deviceCounterPc'; break;
                    case 'NB': typeKey = 'deviceCounterNb'; break;
                    case 'TAB': typeKey = 'deviceCounterTab'; break;
                    case 'MAC': typeKey = 'deviceCounterMac'; break;
                    case 'SRV': typeKey = 'deviceCounterSrv'; break;
                    case 'DIV': typeKey = 'deviceCounterDiv'; break;
                    default: typeKey = '';
                }
                if (customer && typeKey && typeof customer[typeKey] === 'number') {
                    nextNumber = customer[typeKey] + 1;
                }
                if (nextNumber) {
                    setAutoName(`${job.customer.shortCode}-${selectedType}${String(nextNumber).padStart(3, '0')}`);
                }
            } catch (e) {
                setAutoName('');
            } finally {
                setAutoNameLoading(false);
            }
        };
        updateAutoName();
    }, [selectedType, customerId, customer, job.customer?.shortCode]);

    // Staged state for device name/type
    const [stagedDeviceName, setStagedDeviceName] = useState(deviceName);
    const [stagedType, setStagedType] = useState(selectedType);
    useEffect(() => {
        setStagedDeviceName(deviceName);
        setStagedType(selectedType);
    }, [deviceName, selectedType]);

    const isStaged =
        stagedDeviceName !== (job.device?.name || '') ||
        stagedType !== (job.device?.type || '');

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg mt-6">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Device Name</h2>
            </div>
            <div className="px-6 py-4 flex flex-col gap-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Device Type</label>
                <select
                    className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 mb-2"
                    value={selectedType}
                    onChange={e => {
                        setSelectedType(e.target.value);
                        if (!isJobStarted && onJobUpdated) {
                            onJobUpdated({ ...job, device: { ...job.device, type: e.target.value } });
                        }
                        setAutoName(''); // clear auto-name when type changes
                    }}
                    disabled={isJobStarted}
                >
                    <option value="">Select type...</option>
                    <option value="PC">PC</option>
                    <option value="NB">Notebook</option>
                    <option value="TAB">Tablet</option>
                    <option value="MAC">Mac</option>
                    <option value="SRV">Server</option>
                    <option value="DIV">Other</option>
                </select>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Device Name</label>
                <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    value={stagedDeviceName}
                    onChange={e => setStagedDeviceName(e.target.value)}
                    disabled={isJobStarted}
                />
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                    <div className="flex items-center gap-2">
                        Auto-Name:

                        <Tippy disabled={!!autoName} content="No name generation available without a customer set." placement="top">
                            <span className="text-sm text-gray-700 dark:text-gray-200 font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded border border-gray-200 dark:border-gray-600">
                                {autoNameLoading ? 'Generating...' : autoName || 'No auto-name available'}
                            </span>
                        </Tippy>

                        {autoName && (
                            <button
                                className="ml-2 px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                                onClick={() => {
                                    setStagedDeviceName(autoName);
                                    setUsedAutoName(true);
                                }}
                                disabled={isJobStarted}
                            >
                                Use
                            </button>
                        )}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 sm:mt-0 sm:ml-2">
                        The auto-generated name is based on the selected customer and device type, following your organization's naming convention.
                    </span>
                </div>
                <button
                    className="mt-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-400 transition disabled:opacity-50"
                    onClick={async () => {
                        if (!deviceId) {
                            toast.error('Device ID not found.');
                            return;
                        }
                        if (usedAutoName && stagedDeviceName === autoName && customerId && stagedType) {
                            try {
                                await customerService.setDeviceCountersAndOUs(customerId, {
                                    [`deviceCounter${stagedType.charAt(0).toUpperCase() + stagedType.slice(1).toLowerCase()}`]:
                                        (customer && typeof customer[`deviceCounter${stagedType.charAt(0).toUpperCase() + stagedType.slice(1).toLowerCase()}`] === 'number')
                                            ? customer[`deviceCounter${stagedType.charAt(0).toUpperCase() + stagedType.slice(1).toLowerCase()}`] + 1
                                            : 1,
                                });
                            } catch (e) {
                                toast.error('Failed to increment device counter');
                            }
                        }
                        setUsedAutoName(false);
                        await toast.promise(
                            (async () => {
                                await deviceService.updateDevice(deviceId, { name: stagedDeviceName, type: stagedType });
                                if (onJobUpdated) {
                                    onJobUpdated({ ...job, device: { ...job.device, name: stagedDeviceName, type: stagedType } });
                                }
                                toast.success('Device updated successfully.');
                            })(),
                            {
                                loading: 'Updating device...',
                                success: 'Device updated successfully.',
                                error: 'Error updating device.',
                            }
                        );
                    }}
                    disabled={isJobStarted || !isStaged}
                >
                    Save
                </button>
            </div>
        </div>
    );
}
