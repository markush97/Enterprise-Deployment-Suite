import React from 'react';
import { Cpu, HardDrive, Info, Activity, Clock } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="space-y-6">
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
                System Information
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Version 1.0.0
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* System Status */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Activity className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">System Status</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-500 dark:text-gray-400">Uptime</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                4d 5h 23m
              </span>
            </div>
          </div>
        </div>

        {/* Storage */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <HardDrive className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Storage</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500 dark:text-gray-400">Used Space</span>
                <span className="text-gray-900 dark:text-white">750 GB</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: '75%' }}
                ></div>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-gray-500 dark:text-gray-400">
                  250 GB free
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  1 TB total
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CPU */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Cpu className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">CPU</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500 dark:text-gray-400">Usage</span>
                <span className="text-gray-900 dark:text-white">45%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: '45%' }}
                ></div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Cores</span>
                <p className="text-lg font-medium text-gray-900 dark:text-white">8</p>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Temperature</span>
                <p className="text-lg font-medium text-gray-900 dark:text-white">65°C</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}