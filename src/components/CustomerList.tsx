import React, { useState, useEffect } from 'react';
import { Customer } from '../types/customer';
import { customerService } from '../services/customerService';
import { CustomerModal } from './CustomerModal';
import { CustomerPage } from './CustomerPage';
import { Plus, Building2, ChevronRight } from 'lucide-react';

export function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      const data = await customerService.getCustomers();
      setCustomers(data);
    } catch (err) {
      setError('Failed to load customers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt'>) => {
    try {
      await customerService.addCustomer(customerData);
      await loadCustomers();
    } catch (err) {
      throw err;
    }
  };

  const handleEditCustomer = async (id: string, customerData: Partial<Customer>) => {
    try {
      await customerService.updateCustomer(id, customerData);
      await loadCustomers();
    } catch (err) {
      throw err;
    }
  };

  if (showDetails && selectedCustomer) {
    return (
      <CustomerPage 
        customer={selectedCustomer} 
        onBack={() => {
          setShowDetails(false);
          setSelectedCustomer(null);
        }} 
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Building2 className="h-6 w-6 text-gray-500 dark:text-gray-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Customers
              </h2>
            </div>
            <button
              onClick={() => {
                setSelectedCustomer(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/50 border-b border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Short Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pulseway ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {customers.map((customer) => (
                <tr 
                  key={customer.id} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => {
                    setSelectedCustomer(customer);
                    setShowDetails(true);
                  }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Building2 className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{customer.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {customer.settings.defaultClientImage && `Client: ${customer.settings.defaultClientImage}`}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{customer.shortCode}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{customer.pulsewayId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCustomer(customer);
                        setIsModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CustomerModal
        customer={selectedCustomer || undefined}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCustomer(null);
        }}
        onSave={async (data) => {
          if (selectedCustomer) {
            await handleEditCustomer(selectedCustomer.id, data);
          } else {
            await handleAddCustomer(data);
          }
          setIsModalOpen(false);
          setSelectedCustomer(null);
        }}
      />
    </div>
  );
}