import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Customer } from '../../types/customer';
import { ImageList } from '../ImageList';
import { AdminPage } from '../AdminPage';
import { SystemPage } from '../SystemPage';
import { SettingsPage } from '../SettingsPage';
import { WikiPage } from '../WikiPage';
import { DeviceList } from '../DeviceList';
import { DevicePage } from '../DevicePage';
import { CustomerList } from '../CustomerList';
import { JobsPage } from '../JobsPage';
import { LogOut, Users, Monitor, Settings, Cpu, Play } from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';

type ActiveTab = 'devices' | 'customers' | 'images' | 'admin' | 'settings' | 'system' | 'wiki' | 'jobs';

import { useParams } from 'react-router-dom';
import { Device } from '../../types/device'; // Adjust import path as needed
import { useEffect } from 'react';

function DevicePageWrapper() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [device, setDevice] = useState<Device | null>(null);

  useEffect(() => {
    // Replace this with your actual device fetching logic
    async function fetchDevice() {
      // Example: fetch from API or state
      // const response = await fetch(`/api/devices/${id}`);
      // const data = await response.json();
      // setDevice(data);
      // For now, just set a dummy device if id exists
      if (id) {
        setDevice({ id, name: `Device ${id}` } as Device);
      }
    }
    fetchDevice();
  }, [id]);

  if (!device) return <div>Loading...</div>;

  return (
    <DevicePage
      device={device}
      onBack={() => navigate('/dashboard/devices')}
    />
  );
}

export function Dashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Get active tab from current path
  const getActiveTab = () => {
    const path = location.pathname.split('/')[2] || 'jobs';
    return path.split('/')[0] as ActiveTab; // Get the main route without device ID
  };

  const setActiveTab = (tab: ActiveTab) => {
    navigate(`/dashboard/${tab}`);
  };

  const activeTab = getActiveTab();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-white shadow dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img
                src="/logo.png"
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

          {!location.pathname.includes('/devices/') && (
            <div className="mt-4 border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('jobs')}
                  className={`${activeTab === 'jobs'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                    } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  <Play className="h-5 w-5 mr-2" />
                  Jobs
                </button>
                <button
                  onClick={() => setActiveTab('devices')}
                  className={`${activeTab === 'devices'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                    } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  <Monitor className="h-5 w-5 mr-2" />
                  Devices
                </button>
                <button
                  onClick={() => setActiveTab('customers')}
                  className={`${activeTab === 'customers'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                    } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  <Users className="h-5 w-5 mr-2" />
                  Customers
                </button>
                {user?.role === 'administrator' && (
                  <>
                    <button
                      onClick={() => setActiveTab('admin')}
                      className={`${activeTab === 'admin'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                        } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                      <Users className="h-5 w-5 mr-2" />
                    </button>
                    <button
                      onClick={() => setActiveTab('settings')}
                      className={`${activeTab === 'settings'
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
                  className={`${activeTab === 'system'
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
        <Routes>
          <Route path="jobs" element={<JobsPage />} />
          <Route path="devices" element={<DeviceList />} />
          <Route path="devices/:id" element={<DevicePageWrapper />} />
          <Route path="customers" element={<CustomerList />} />
          <Route path="images" element={<ImageList />} />
          <Route path="admin" element={<AdminPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="system" element={<SystemPage />} />
          <Route path="wiki" element={<WikiPage />} />
          <Route path="" element={<Navigate to="jobs" replace />} />
        </Routes>
      </main>
    </div>
  );
}
