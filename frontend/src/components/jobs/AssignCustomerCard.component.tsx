import { ChevronDownIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/react';
import Tippy from '@tippyjs/react';

interface CustomerOption {
  id: string;
  name: string;
  shortCode: string;
}

interface AssignCustomerProps {
  customerOptions: CustomerOption[];
  stagedCustomer: string;
  setStagedCustomer: (id: string) => void;
  isAssigning: boolean;
  savingCustomer: boolean;
  selectedCustomer: string;
  handleAssign: (type: 'customer', value: string) => Promise<void>;
  tooltip?: string;
}

export function AssignCustomerCard({
  customerOptions,
  stagedCustomer,
  setStagedCustomer,
  isAssigning,
  savingCustomer,
  selectedCustomer,
  handleAssign,
  tooltip,
}: AssignCustomerProps) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg mt-6">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Assign Customer</h2>
      </div>
      <div className="px-6 py-4 flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Customer
          </label>
          <div className={tooltip ? 'relative' : ''}>
            <Tippy content={tooltip} disabled={!tooltip} placement="top-end">
              <div>
                <Combobox
                  value={customerOptions.find(c => c.id === stagedCustomer) || null}
                  onChange={val => {
                    if (val) setStagedCustomer(val.id);
                  }}
                  disabled={isAssigning || savingCustomer}
                >
                  <div className="relative">
                    <ComboboxInput
                      className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      displayValue={(c: any) => (c ? `${c.shortCode} - ${c.name}` : '')}
                      placeholder="Select customer..."
                    />
                    <ComboboxButton className="group absolute inset-y-0 right-0 px-2.5">
                      <ChevronDownIcon className="size-4 fill-white/60 group-data-hover:fill-white" />
                    </ComboboxButton>
                    <ComboboxOptions className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                      {customerOptions.length === 0 && (
                        <div className="px-4 py-2 text-gray-500">No customers found</div>
                      )}
                      {customerOptions.map(c => (
                        <ComboboxOption
                          key={c.id}
                          value={c}
                          className={({ active }) =>
                            `cursor-pointer select-none px-4 py-2 ${active ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-100'}`
                          }
                        >
                          {c.shortCode} - {c.name}
                        </ComboboxOption>
                      ))}
                    </ComboboxOptions>
                  </div>
                </Combobox>
              </div>
            </Tippy>
          </div>
        </div>
        {stagedCustomer && (
          <div className="text-sm text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 rounded p-3 border border-gray-200 dark:border-gray-600">
            {(() => {
              const c = customerOptions.find(c => c.id === stagedCustomer);
              if (!c) return null;
              return (
                <>
                  <div>
                    <span className="font-semibold">Name:</span> {c.name}
                  </div>
                  <div>
                    <span className="font-semibold">Short Code:</span> {c.shortCode}
                  </div>
                </>
              );
            })()}
          </div>
        )}
        <button
          className="mt-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-400 transition disabled:opacity-50"
          onClick={async () => {
            await handleAssign('customer', stagedCustomer);
          }}
          disabled={isAssigning || savingCustomer || stagedCustomer === selectedCustomer}
        >
          {savingCustomer ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}
