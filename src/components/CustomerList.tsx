import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Customer } from '../types/customer';
import { customerService } from '../services/customerService';
import { CustomerModal } from './CustomerModal';
import { CustomerPage } from './CustomerPage';
import { CustomerListSkeleton } from './CustomerSkeleton';
import { Plus, Building2, ChevronRight, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function CustomerList() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Fetch customers
  const {
    data: customers = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['customers'],
    queryFn: customerService.getCustomers
  });

  // Add customer mutation
  const addCustomerMutation = useMutation({
    mutationFn: customerService.addCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add customer');
      throw error;
    }
  });

  // Update customer mutation
  const updateCustomerMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Customer> }) =>
      customerService.updateCustomer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update customer');
      throw error;
    }
  });

  // Handle adding customer
  const handleAddCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt'>) => {
    try {
      await addCustomerMutation.mutateAsync(customerData);
      setIsModalOpen(false);
    } catch (error) {
      // Error is already handled in the mutation
    }
  };

  // Handle editing customer
  const handleEditCustomer = async (id: string, customerData: Partial<Customer>) => {
    try {
      await updateCustomerMutation.mutateAsync({ id, data: customerData });
      setIsModalOpen(false);
    } catch (error) {
      // Error is already handled in the mutation
    }
  };

  // Render customer details page
  if (showDetails && selectedCustomer) {
    return (
      <CustomerPage
        customer={selectedCustomer}
        onBack={() => {
          setShowDetails(false);
          setSelectedCustomer(null);
          refetch(); // Refresh the list when coming back
        }}
        onCustomerUpdated={(updatedCustomer: Customer) => {
          setSelectedCustomer(updatedCustomer);
        }}
        onCustomerDeleted={() => {
          queryClient.invalidateQueries({ queryKey: ['customers'] });
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden transition-all duration-300">
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
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </button>
          </div>
        </div>

        {isError && (
          <div className="p-4 bg-red-50 dark:bg-red-900/30 border-b border-red-200 dark:border-red-800">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-sm text-red-600 dark:text-red-400">
                {error instanceof Error ? error.message : 'Failed to load customers'}
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline focus:outline-none"
            >
              Try again
            </button>
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
              {isLoading ? (
                <CustomerListSkeleton />
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center justify-center">
                      <Building2 className="h-12 w-12 text-gray-400 mb-3" />
                      <p className="text-lg font-medium">No customers found</p>
                      <p className="text-sm mt-1">Add your first customer to get started</p>
                      <button
                        onClick={() => {
                          setSelectedCustomer(null);
                          setIsModalOpen(true);
                        }}
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Customer
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                customers.map((customer: Customer) => (
                  <tr
                    key={customer.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition duration-150 ease-in-out"
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
                            {customer.settings?.defaultClientImage && `Client: ${customer.settings.defaultClientImage}`}
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
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition duration-150 ease-in-out"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
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
        }}
      />
    </div>
  );
}
