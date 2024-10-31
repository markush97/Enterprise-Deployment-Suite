import React, { useEffect } from 'react';
import { useDeviceStore } from '../stores/deviceStore';
import { DeviceList } from './Dashboard/DeviceList';
import { Plus, Server } from 'lucide-react';

interface CustomerDeviceListProps {
  customerId: string;
}

export function CustomerDeviceList({ customerId }: CustomerDeviceListProps) {
  const {
    devices,
    isLoading,
    error,
    fetchDevices,
    deleteDevice,
  } = useDeviceStore();

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const customerDevices = devices.filter(device => device.name.startsWith(customerId));

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Server className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Customer Devices
            </h3>
          </div>
          <button
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Device
          </button>
        </div>
      </div>

      {error && (
        <div className="px-6 py-4 bg-red-50 dark:bg-red-900/50 border-b border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="px-6 py-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
      ) : (
        <DeviceList
          devices={customerDevices}
          onEdit={() => {}}
          onDelete={deleteDevice}
        />
      )}
    </div>
  );
}