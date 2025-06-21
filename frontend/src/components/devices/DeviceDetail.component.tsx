import { useNavigate } from 'react-router-dom';
import type { Device } from '../../types/device.interface';
import { ArrowLeft, Monitor } from 'lucide-react';

interface DeviceDetailProps {
    device: Device;
    onBack: () => void;
}

export function DeviceDetail({ device, onBack }: DeviceDetailProps) {
    const navigate = useNavigate();
    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center mb-6">
                <button
                    onClick={() => onBack()}
                    className="inline-flex items-center mr-4 px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Devices
                </button>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {device.name || device.serialNumber || device.id}
                </h1>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3">
                    <Monitor className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Device Details
                    </h2>
                </div>
                <div className="px-6 py-4">
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                        <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</dt>
                            <dd className="mt-1 text-lg text-gray-900 dark:text-white">{device.name || 'N/A'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</dt>
                            <dd className="mt-1 text-lg text-gray-900 dark:text-white">{device.type || 'N/A'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Serial Number</dt>
                            <dd className="mt-1 text-lg text-gray-900 dark:text-white">{device.serialNumber || 'N/A'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Asset Tag</dt>
                            <dd className="mt-1 text-lg text-gray-900 dark:text-white">{device.assetTag || 'N/A'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">ID</dt>
                            <dd className="mt-1 text-lg text-gray-900 dark:text-white">{device.id}</dd>
                        </div>
                    </dl>
                </div>
            </div>
        </div>
    );
}
