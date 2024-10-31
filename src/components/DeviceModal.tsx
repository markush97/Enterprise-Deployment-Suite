import React, { useState, useEffect } from 'react';
import { Device, DeviceType, OperatingSystem } from '../types/device';
import { Customer } from '../types/customer';
import { X, Loader2 } from 'lucide-react';

interface DeviceModalProps {
  device?: Device;
  customers: Customer[];
  currentUser: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (device: Omit<Device, 'id' | 'createdAt'>) => Promise<void>;
}

export function DeviceModal({ device, customers, currentUser, isOpen, onClose, onSave }: DeviceModalProps) {
  const [formData, setFormData] = useState<Omit<Device, 'id' | 'createdAt'>>({
    name: '',
    type: 'client',
    createdBy: currentUser,
    macAddress: '',
    bitlockerKey: '',
    osVersion: 'Windows 11',
    imageName: '',
  });
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setError(null);
  }, [device, currentUser, customers, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const customer = customers.find(c => c.id === selectedCustomer);
      if (!customer) throw new Error('Please select a customer');

      // Use default image based on device type
      const defaultImage = formData.type === 'client' 
        ? customer.settings.defaultClientImage 
        : customer.settings.defaultServerImage;

      await onSave({
        ...formData,
        imageName: formData.imageName || defaultImage || '',
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {device ? 'Edit Device' : 'Add New Device'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/50 border-l-4 border-red-400 p-4 text-sm text-red-700 dark:text-red-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            {!device && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Customer
                </label>
                <select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Device Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as DeviceType })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={!!device}
              >
                <option value="client">Client</option>
                <option value="server">Server</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                MAC Address
              </label>
              <input
                type="text"
                value={formData.macAddress}
                onChange={(e) => setFormData({ ...formData, macAddress: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                pattern="^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$"
                placeholder="00:1A:2B:3C:4D:5E"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                BitLocker Key
              </label>
              <input
                type="text"
                value={formData.bitlockerKey}
                onChange={(e) => setFormData({ ...formData, bitlockerKey: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                OS Version
              </label>
              <select
                value={formData.osVersion}
                onChange={(e) => setFormData({ ...formData, osVersion: e.target.value as OperatingSystem })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="Windows 11">Windows 11</option>
                <option value="Windows 10">Windows 10</option>
                <option value="Windows Server 2022">Windows Server 2022</option>
                <option value="Windows Server 2019">Windows Server 2019</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Image Name
              </label>
              <input
                type="text"
                value={formData.imageName}
                onChange={(e) => setFormData({ ...formData, imageName: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder={
                  selectedCustomer
                    ? `Default: ${
                        formData.type === 'client'
                          ? customers.find(c => c.id === selectedCustomer)?.settings.defaultClientImage
                          : customers.find(c => c.id === selectedCustomer)?.settings.defaultServerImage
                      }`
                    : 'Select a customer first'
                }
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                device ? 'Save Changes' : 'Add Device'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}