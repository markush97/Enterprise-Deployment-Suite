import React from 'react';
import { useAdminStore } from '../../stores/adminStore';
import { Shield, Check } from 'lucide-react';

export function RoleList() {
  const { roles } = useAdminStore();

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">System Roles</h3>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {roles.map((role) => (
            <div key={role.id} className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Shield className={`h-6 w-6 ${
                  role.name === 'administrator' 
                    ? 'text-purple-500' 
                    : role.name === 'systemengineer'
                      ? 'text-green-500'
                      : 'text-gray-500'
                }`} />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white capitalize">
                  {role.name}
                </h4>
              </div>
              
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {role.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {role.permissions.map((permission) => (
                  <div
                    key={permission}
                    className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300"
                  >
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{permission}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}