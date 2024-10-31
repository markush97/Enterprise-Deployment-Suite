import React from 'react';
import { DeviceType, OperatingSystem, DeviceFilters as DeviceFiltersType } from '../../types/device';
import { Search } from 'lucide-react';

interface DeviceFiltersPanelProps {
  filters: DeviceFiltersType;
  onFilterChange: (filters: Partial<DeviceFiltersType>) => void;
}

export function DeviceFiltersPanel({ filters, onFilterChange }: DeviceFiltersPanelProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6 space-y-4">
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
            <input
              type="text"
              placeholder="Search devices..."
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              className="pl-10 w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:placeholder-gray-400"
            />
          </div>
        </div>
        
        <div className="w-48">
          <select
            value={filters.type}
            onChange={(e) => onFilterChange({ type: e.target.value as DeviceType | 'all' })}
            className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
          >
            <option value="all">All Types</option>
            <option value="client">Clients</option>
            <option value="server">Servers</option>
          </select>
        </div>

        <div className="w-48">
          <select
            value={filters.osVersion}
            onChange={(e) => onFilterChange({ osVersion: e.target.value as OperatingSystem | 'all' })}
            className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
          >
            <option value="all">All OS Versions</option>
            <option value="Windows 11">Windows 11</option>
            <option value="Windows 10">Windows 10</option>
            <option value="Windows Server 2022">Windows Server 2022</option>
            <option value="Windows Server 2019">Windows Server 2019</option>
          </select>
        </div>
      </div>
    </div>
  );
}