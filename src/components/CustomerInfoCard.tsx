import React from 'react';
import { Customer } from '../types/customer';
import { Calendar, Hash, Link, Clock } from 'lucide-react';

interface CustomerInfoCardProps {
  customer: Customer;
}

export function CustomerInfoCard({ customer }: CustomerInfoCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Customer Information
        </h3>
      </div>
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start space-x-3">
            <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</p>
              <p className="text-sm text-gray-900 dark:text-white">
                {new Date(customer.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Hash className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Short Code</p>
              <p className="text-sm text-gray-900 dark:text-white">{customer.shortCode}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Link className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pulseway ID</p>
              <p className="text-sm text-gray-900 dark:text-white">{customer.pulsewayId}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Clock className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</p>
              <p className="text-sm text-gray-900 dark:text-white">
                {new Date().toLocaleDateString()} {/* Replace with actual last updated date */}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}