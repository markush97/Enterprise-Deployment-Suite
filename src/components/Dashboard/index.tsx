import React, { useEffect, useState } from 'react';
import { useDeviceStore } from '../../stores/deviceStore';
import { useCustomerStore } from '../../stores/customerStore';
import { useAuthStore } from '../../stores/authStore';
import { Customer } from '../../types/customer';
import { CustomerPage } from '../CustomerPage';
import { ImageList } from '../ImageList';
import { AdminPage } from '../AdminPage';
import { SystemPage } from '../SystemPage';
import { SettingsPage } from '../SettingsPage';
import { WikiPage } from '../WikiPage';
import { DeviceList } from '../DeviceList';
import { CustomerList } from '../CustomerList';
import { JobsPage } from '../JobsPage';
import { Plus, LogOut, Users, Monitor, HardDrive, Settings, Cpu, Book, Play } from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';

type ActiveTab = 'devices' | 'customers' | 'images' | 'admin' | 'settings' | 'system' | 'wiki' | 'jobs';

export function Dashboard() {
  const { user, logout } = useAuthStore();
  // Start with wiki tab active
  const [activeTab, setActiveTab] = useState<ActiveTab>('wiki');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-white shadow dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img
                src="/cwi-logo.svg"
                alt="CWI Logo"
                className="h-8 mr-4"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Management</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage your systems and customers</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Logged in as <span className="font-medium">{user?.email}</span>
              </span>
              <button
                onClick={logout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>

          {!selectedCustomer && (
            <div className="mt-4 border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('wiki')}
                  className={`${
                    activeTab === 'wiki'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                  } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  <Book className="h-5 w-5 mr-2" />
                  Documentation
                </button>
                <button
                  onClick={() => setActiveTab('jobs')}
                  className={`${
                    activeTab === 'jobs'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                  } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  <Play className="h-5 w-5 mr-2" />
                  Jobs
                </button>
                <button
                  onClick={() => setActiveTab('devices')}
                  className={`${
                    activeTab === 'devices'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                  } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  <Monitor className="h-5 w-5 mr-2" />
                  Devices
                </button>
                <button
                  onClick={() => setActiveTab('customers')}
                  className={`${
                    activeTab === 'customers'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                  } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  <Users className="h-5 w-5 mr-2" />
                  Customers
                </button>
                <button
                  onClick={() => setActiveTab('images')}
                  className={`${
                    activeTab === 'images'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                  } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  <HardDrive className="h-5 w-5 mr-2" />
                  Images
                </button>
                {user?.role === 'administrator' && (
                  <>
                    <button
                      onClick={() => setActiveTab('admin')}
                      className={`${
                        activeTab === 'admin'
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                      } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                      <Users className="h-5 w-5 mr-2" />
                      Administration
                    </button>
                    <button
                      onClick={() => setActiveTab('settings')}
                      className={`${
                        activeTab === 'settings'
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                      } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                      <Settings className="h-5 w-5 mr-2" />
                      Settings
                    </button>
                  </>
                )}
                <button
                  onClick={() => setActiveTab('system')}
                  className={`${
                    activeTab === 'system'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                  } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  <Cpu className="h-5 w-5 mr-2" />
                  System
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedCustomer ? (
          <CustomerPage customer={selectedCustomer} onBack={() => setSelectedCustomer(null)} />
        ) : activeTab === 'devices' ? (
          <DeviceList />
        ) : activeTab === 'customers' ? (
          <CustomerList />
        ) : activeTab === 'images' ? (
          <ImageList />
        ) : activeTab === 'admin' ? (
          <AdminPage />
        ) : activeTab === 'settings' ? (
          <SettingsPage />
        ) : activeTab === 'wiki' ? (
          <WikiPage />
        ) : activeTab === 'jobs' ? (
          <JobsPage />
        ) : (
          <SystemPage />
        )}
      </main>
    </div>
  );
}