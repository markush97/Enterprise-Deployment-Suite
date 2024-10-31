import React, { useState, useEffect } from 'react';
import { Customer } from '../types/customer';
import { X } from 'lucide-react';

interface CustomerModalProps {
  customer?: Customer;
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Omit<Customer, 'id' | 'createdAt'>) => Promise<void>;
}

export function CustomerModal({ customer, isOpen, onClose, onSave }: CustomerModalProps) {
  const [formData, setFormData] = useState<Omit<Customer, 'id' | 'createdAt'>>({
    name: '',
    shortCode: '',
    pulsewayId: '',
    settings: {
      defaultClientImage: '',
      defaultServerImage: '',
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (customer) {
      const { id, createdAt, ...rest } = customer;
      setFormData(rest);
    } else {
      setFormData({
        name: '',
        shortCode: '',
        pulsewayId: '',
        settings: {
          defaultClientImage: '',
          defaultServerImage: '',
        }
      });
    }
    setError(null);
  }, [customer, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onSave(formData);
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {customer ? 'Edit Customer' : 'Add New Customer'}
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

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Customer Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Short Code
              </label>
              <input
                type="text"
                value={formData.shortCode}
                onChange={(e) => setFormData({ ...formData, shortCode: e.target.value.toUpperCase() })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                maxLength={5}
                pattern="[A-Z]{2,5}"
                title="2-5 uppercase letters"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                2-5 uppercase letters (e.g., EXC)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Pulseway ID
              </label>
              <input
                type="text"
                value={formData.pulsewayId}
                onChange={(e) => setFormData({ ...formData, pulsewayId: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Default Client Image
              </label>
              <input
                type="text"
                value={formData.settings.defaultClientImage || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  settings: { ...formData.settings, defaultClientImage: e.target.value }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., Windows 11 Enterprise 22H2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Default Server Image
              </label>
              <input
                type="text"
                value={formData.settings.defaultServerImage || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  settings: { ...formData.settings, defaultServerImage: e.target.value }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., Windows Server 2022"
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
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : customer ? 'Save Changes' : 'Add Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}