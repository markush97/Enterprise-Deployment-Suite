import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Server, Clock, Cpu, Database, MonitorDot, Image as ImageIcon, Loader2, Terminal } from 'lucide-react';
import { systemService } from '../../services/system.service';


export function SystemPage() {
  const { data: systemInfo, isLoading, error } = useQuery({
    queryKey: ['system'],
    queryFn: systemService.getSystemInfo,
    refetchInterval: 5000 // Refresh every 5 seconds
  });

  const formatBytes = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    return `${days}d ${hours}h ${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !systemInfo) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>Failed to load system information</p>
      </div>
    );
  }

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
                Version {systemInfo.version}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center">
            <MonitorDot className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Devices</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{systemInfo.stats.totalDevices}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{systemInfo.stats.activeDevices} active</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center">
            <ImageIcon className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">System Images</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">-1</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">-1 total</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">System Uptime</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{formatUptime(systemInfo.uptime)}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Since last restart</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center">
            <Terminal className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Operating System</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white capitalize">{systemInfo.os.platform}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{systemInfo.os.release}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Memory Usage */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Server className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Memory Usage</h2>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500 dark:text-gray-400">Used Memory</span>
                <span className="text-gray-900 dark:text-white">{formatBytes(systemInfo.memory.used)}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${(systemInfo.memory.used / systemInfo.memory.total) > 0.9
                    ? 'bg-red-600'
                    : (systemInfo.memory.used / systemInfo.memory.total) > 0.7
                      ? 'bg-yellow-600'
                      : 'bg-green-600'
                    }`}
                  style={{ width: `${(systemInfo.memory.used / systemInfo.memory.total) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-gray-500 dark:text-gray-400">
                  {formatBytes(systemInfo.memory.free)} free
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {formatBytes(systemInfo.memory.total)} total
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
                <span className="text-gray-900 dark:text-white">{systemInfo.cpu.usage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${systemInfo.cpu.usage > 90 ? 'bg-red-600' : systemInfo.cpu.usage > 70 ? 'bg-yellow-600' : 'bg-green-600'
                    }`}
                  style={{ width: `${systemInfo.cpu.usage}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Cores</span>
                <p className="text-lg font-medium text-gray-900 dark:text-white">{systemInfo.cpu.cores}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Temperature</span>
                <p className="text-lg font-medium text-gray-900 dark:text-white">-1°C</p>
              </div>
            </div>

            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Model</span>
              <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{systemInfo.cpu.model}</p>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Terminal className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">System Details</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Platform</span>
                <p className="text-lg font-medium text-gray-900 dark:text-white capitalize">{systemInfo.os.platform}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Architecture</span>
                <p className="text-lg font-medium text-gray-900 dark:text-white">{systemInfo.os.arch}</p>
              </div>
            </div>

            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">OS Version</span>
              <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{systemInfo.os.version}</p>
            </div>

            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Hostname</span>
              <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{systemInfo.os.hostname}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
