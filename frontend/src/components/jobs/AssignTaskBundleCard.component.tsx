import { ChevronDownIcon } from 'lucide-react';

import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/react';
import Tippy from '@tippyjs/react';

interface Task {
  id: string;
  name: string;
  description?: string;
}

interface Customer {
  id: string;
  name: string;
  shortCode?: string;
}

interface TaskBundleOption {
  id: string;
  name: string;
  description?: string;
  taskList?: Task[];
  customer?: Customer;
}

interface AssignTaskBundleProps {
  taskBundleOptions: TaskBundleOption[];
  stagedTaskBundle: string;
  setStagedTaskBundle: (id: string) => void;
  isAssigning: boolean;
  savingTaskBundle: boolean;
  selectedTaskBundle: string;
  handleAssign: (type: 'taskBundle', value: string) => Promise<void>;
  tooltip?: string;
}

export function AssignTaskBundleCard({
  taskBundleOptions,
  stagedTaskBundle,
  setStagedTaskBundle,
  isAssigning,
  savingTaskBundle,
  selectedTaskBundle,
  handleAssign,
  tooltip,
}: AssignTaskBundleProps) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg mt-6">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Assign Task Bundle</h2>
      </div>
      <div className="px-6 py-4 flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Task Bundle
          </label>
          <div className={tooltip ? 'relative' : ''}>
            <Tippy content={tooltip} disabled={!tooltip} placement="top-end">
              <div>
                <Combobox
                  value={taskBundleOptions.find(tb => tb.id === stagedTaskBundle) || null}
                  onChange={val => {
                    if (val) setStagedTaskBundle(val.id);
                  }}
                  disabled={isAssigning || savingTaskBundle}
                >
                  <div className="relative">
                    <ComboboxInput
                      className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      displayValue={(tb: any) => (tb ? tb.name : '')}
                      placeholder="Select task bundle..."
                    />
                    <ComboboxButton className="group absolute inset-y-0 right-0 px-2.5">
                      <ChevronDownIcon className="size-4 fill-white/60 group-data-hover:fill-white" />
                    </ComboboxButton>
                    <ComboboxOptions className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                      {taskBundleOptions.length === 0 && (
                        <div className="px-4 py-2 text-gray-500">No task bundles found</div>
                      )}
                      {taskBundleOptions.map(tb => (
                        <ComboboxOption
                          key={tb.id}
                          value={tb}
                          className={({ active }) =>
                            `cursor-pointer select-none px-4 py-2 ${active ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-100'}`
                          }
                        >
                          {tb.name}
                        </ComboboxOption>
                      ))}
                    </ComboboxOptions>
                  </div>
                </Combobox>
              </div>
            </Tippy>
          </div>
        </div>
        {stagedTaskBundle && (
          <div className="text-sm text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 rounded p-3 border border-gray-200 dark:border-gray-600">
            {(() => {
              const tb = taskBundleOptions.find(tb => tb.id === stagedTaskBundle);
              if (!tb) return null;
              return (
                <>
                  <div>
                    <span className="font-semibold">Name:</span>{' '}
                    <a
                      href={`/taskbundles/${tb.id}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {tb.name}
                    </a>
                  </div>
                  {tb.description && (
                    <div>
                      <span className="font-semibold">Description:</span> {tb.description}
                    </div>
                  )}
                  {tb.taskList && tb.taskList.length > 0 && (
                    <div className="mt-2">
                      <span className="font-semibold">Tasks:</span>
                      <ol
                        className="list-decimal pl-5 mt-1"
                        style={{ listStyleType: 'decimal', paddingLeft: '1.5rem' }}
                      >
                        {tb.taskList.map((task: any) => {
                          const desc = task.description || '';
                          const shortDesc = desc.length > 40 ? desc.slice(0, 40) + '…' : desc;
                          return (
                            <li
                              key={task.id}
                              className="truncate"
                              title={desc.length > 40 ? desc : undefined}
                              style={{ display: 'list-item' }}
                            >
                              <a
                                href={`/tasks/${task.id}`}
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {task.name}
                              </a>
                              {desc ? ` (${shortDesc})` : ''}
                            </li>
                          );
                        })}
                      </ol>
                    </div>
                  )}
                  {tb.customer && (
                    <div className="mt-2">
                      <span className="font-semibold">Customer:</span>{' '}
                      <a
                        href={`/customers/${tb.customer.id}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {tb.customer.shortCode || tb.customer.name || tb.customer.id}
                      </a>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
        <button
          className="mt-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-400 transition disabled:opacity-50"
          onClick={async () => {
            await handleAssign('taskBundle', stagedTaskBundle);
          }}
          disabled={isAssigning || savingTaskBundle || stagedTaskBundle === selectedTaskBundle}
        >
          {savingTaskBundle ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}
