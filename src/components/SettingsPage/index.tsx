import React from 'react';
import { Settings as SettingsIcon, Network, ChevronRight } from 'lucide-react';
import { NetworkingSection } from './NetworkingSection';

export function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-4">
            <img
              src="/cwi-logo.svg"
              alt="CWI Logo"
              className="h-10"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Settings
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                System Configuration
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="col-span-12 md:col-span-3">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <nav className="space-y-1 p-4">
              <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/50 rounded-md group">
                <Network className="h-5 w-5 mr-3" />
                Networking
                <ChevronRight className="ml-auto h-5 w-5" />
              </button>
              {/* Add more navigation items here */}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="col-span-12 md:col-span-9">
          <NetworkingSection />
        </div>
      </div>
    </div>
  );
}