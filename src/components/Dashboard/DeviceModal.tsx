import React, { useState, useEffect } from 'react';
import { Device, DeviceType, OperatingSystem } from '../../types/device';
import { useCustomerStore } from '../../stores/customerStore';
import { X } from 'lucide-react';

interface DeviceModalProps {
  device?: Device;
  isOpen: boolean;
  onClose: () => void;
  onSave: (device: Omit<Device, 'id' | 'createdAt'>) => void;
  currentUser: string;
}

export function DeviceModal({ device, isOpen, onClose, onSave, currentUser }: DeviceModalProps) {
  const { customers } = useCustomerStore();
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [formData, setFormData] = useState<Omit<Device, 'id' | 'createdAt'>>({
    name: '',
    type: 'client',
    createdBy: currentUser,
    macAddress: '',
    bitlockerKey: '',
    osVersion: 'Windows 11',
    imageName: '',
  });

  useEffect(() => {
    if (device) {
      const { id, createdAt, ...rest } = device;
      setFormData(rest);
      // Extract customer code from device name
      const customerCode = device.name.split('-')[0];
      setSelectedCustomer(customers.find(c => c.shortCode === customerCode)?.id || '');
    } else {
      setFormData({
        name: '',
        type: 'client',
        createdBy: currentUser,
        macAddress: '',
        bitlockerKey: '',
        osVersion: 'Windows 11',
        imageName: '',
      });
      setSelectedCustomer('');
    }
  }, [device, currentUser, customers]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customer = customers.find(c => c.id === selectedCustomer);
    if (!customer) return;

    // Get the last device number for this customer and type
    const existingDevices = device ? [] : customers
      .filter(c => c.shortCode === customer.shortCode)
      .map(c => parseInt(c.name.split('-')[2] || '0', 10))
      .filter(n => !isNaN(n));

    const nextNumber = existingDevices.length > 0 
      ? Math.max(...existingDevices) + 1 
      : 1;

    const deviceName = device?.name || `${customer.shortCode}-${formData.type.toUpperCase()}-${String(nextNumber).padStart(3, '0')}`;

    onSave({
      ...formData,
      name: deviceName,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {device ? 'Edit Device' : 'Add New Device'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {!device && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Customer</label>
                <select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} ({customer.shortCode})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as DeviceType })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={!!device}
              >
                <option value="client">Client</option>
                <option value="server">Server</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">MAC Address</label>
              <input
                type="text"
                value={formData.macAddress}
                onChange={(e) => setFormData({ ...formData, macAddress: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                pattern="^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$"
                placeholder="00:1A:2B:3C:4D:5E"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">BitLocker Key</label>
              <input
                type="text"
                value={formData.bitlockerKey}
                onChange={(e) => setFormData({ ...formData, bitlockerKey: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">OS Version</label>
              <select
                value={formData.osVersion}
                onChange={(e) => setFormData({ ...formData, osVersion: e.target.value as OperatingSystem })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="Windows 11">Windows 11</option>
                <option value="Windows 10">Windows 10</option>
                <option value="Windows Server 2022">Windows Server 2022</option>
                <option value="Windows Server 2019">Windows Server 2019</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image Name</label>
              <input
                type="text"
                value={formData.imageName}
                onChange={(e) => setFormData({ ...formData, imageName: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {device ? 'Save Changes' : 'Add Device'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}