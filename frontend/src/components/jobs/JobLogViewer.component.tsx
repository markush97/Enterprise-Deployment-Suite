import React, { useState } from 'react';

export interface JobLogEntry {
  timestamp: string;
  level: string;
  message: string;
  taskId?: string;
}

interface JobLogViewerProps {
  logs: JobLogEntry[];
}

const LOG_LEVELS = [
  { value: 'info', label: 'Info' },
  { value: 'warn', label: 'Warn' },
  { value: 'error', label: 'Error' },
  { value: 'debug', label: 'Debug' },
];

export const JobLogViewer: React.FC<JobLogViewerProps> = ({ logs }) => {
  // Multi-select log level filter
  const [selectedLevels, setSelectedLevels] = useState<string[]>(['info', 'warn', 'error']);

  const toggleLevel = (level: string) => {
    setSelectedLevels(levels =>
      levels.includes(level) ? levels.filter(l => l !== level) : [...levels, level],
    );
  };

  // Filter logs by selected levels
  const filteredLogs = logs.filter(log => selectedLevels.includes(log.level));
  // Sort logs by timestamp ascending (chronological)
  const sortedLogs = [...filteredLogs].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mt-6">
      <h3 className="text-lg font-semibold mb-4">Job Log</h3>
      <div className="flex items-center mb-2 gap-4">
        <div className="flex gap-2 flex-wrap">
          {LOG_LEVELS.map(lvl => (
            <label
              key={lvl.value}
              className="inline-flex items-center text-xs font-medium gap-1 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedLevels.includes(lvl.value)}
                onChange={() => toggleLevel(lvl.value)}
                className="accent-blue-600"
              />
              <span
                className={
                  lvl.value === 'error'
                    ? 'text-red-600 dark:text-red-400'
                    : lvl.value === 'warn'
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : lvl.value === 'debug'
                        ? 'text-gray-400 dark:text-gray-500'
                        : 'text-gray-700 dark:text-gray-200'
                }
              >
                {lvl.label}
              </span>
            </label>
          ))}
        </div>
      </div>
      <div className="overflow-y-auto" style={{ maxHeight: 400 }}>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="px-2 py-1 text-left">Time</th>
              <th className="px-2 py-1 text-left">Level</th>
              <th className="px-2 py-1 text-left">Task</th>
              <th className="px-2 py-1 text-left">Message</th>
            </tr>
          </thead>
          <tbody>
            {sortedLogs.map((log, idx) => (
              <tr key={idx} className="border-b border-gray-100 dark:border-gray-700">
                <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td
                  className={`px-2 py-1 font-semibold ${log.level === 'error' ? 'text-red-600 dark:text-red-400' : log.level === 'warn' ? 'text-yellow-600 dark:text-yellow-400' : log.level === 'success' ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-200'}`}
                >
                  {log.level}
                </td>
                <td className="px-2 py-1 text-xs text-gray-600 dark:text-gray-300">
                  {log.taskId || '-'}
                </td>
                <td className="px-2 py-1 text-gray-900 dark:text-gray-100">{log.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {sortedLogs.length === 0 && (
          <div className="text-gray-500 dark:text-gray-400 text-center py-4">
            No logs available.
          </div>
        )}
      </div>
    </div>
  );
};
