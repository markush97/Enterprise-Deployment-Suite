import React, { useState } from 'react';
import { Customer } from '../types/customer';
import { useCustomerStore } from '../stores/customerStore';
import { CustomerVpnSection } from './CustomerVpnSection';
import { CustomerInfoCard } from './CustomerInfoCard';
import { CustomerDeviceList } from './CustomerDeviceList';
import { CustomerImageList } from './CustomerImageList';
import { CustomerModal } from './CustomerModal';
import { Edit, Trash2, Building2 } from 'lucide-react';

interface CustomerPageProps {
  customer: Customer;
  onBack: () => void;
}

export function CustomerPage({ customer, onBack }: CustomerPageProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { updateCustomer, deleteCustomer } = useCustomerStore();

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      await deleteCustomer(customer.id);
      onBack();
    }
  };

  const handleSave = async (updatedCustomer: Omit<Customer, 'id' | 'createdAt'>) => {
    await updateCustomer(customer.id, updatedCustomer);
    setIsEditModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <img
                src="https://cwi.at/wp-content/uploads/2022/11/cwi-logo-1.svg"
                alt="CWI Logo"
                className="h-10"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {customer.name}
                  </h1>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Customer Code: {customer.shortCode} | Pulseway ID: {customer.pulsewayId}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleEdit}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Customer
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Customer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Info Card */}
      <CustomerInfoCard customer={customer} />

      {/* VPN Configuration */}
      <CustomerVpnSection customer={customer} />

      {/* Device List */}
      <CustomerDeviceList customerId={customer.id} />

      {/* System Images */}
      <CustomerImageList customerId={customer.id} />

      {/* Edit Modal */}
      <CustomerModal
        customer={customer}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}