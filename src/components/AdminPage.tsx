import React, { useState, useEffect } from 'react';
import { useAdminStore } from '../stores/adminStore';
import { UserList } from './admin/UserList';
import { RoleList } from './admin/RoleList';
import { Users, Shield } from 'lucide-react';

type ActiveTab = 'users' | 'roles';

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('users');
  const { fetchUsers, fetchRoles } = useAdminStore();

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [fetchUsers, fetchRoles]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-4">
            <img
              src="https://cwi.at/wp-content/uploads/2022/11/cwi-logo-1.svg"
              alt="CWI Logo"
              className="h-10"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                System Administration
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage users and roles
              </p>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('users')}
              className={`${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <Users className="h-5 w-5 mr-2" />
              Users
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`${
                activeTab === 'roles'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <Shield className="h-5 w-5 mr-2" />
              Roles
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'users' ? <UserList /> : <RoleList />}
    </div>
  );
}