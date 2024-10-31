import React, { useState, useRef, useEffect } from 'react';
import { Customer } from '../../types/customer';
import { Search, Building2, X } from 'lucide-react';

interface CustomerSelectProps {
  customers: Customer[];
  selectedCustomer: Customer | null;
  onSelect: (customer: Customer | null) => void;
}

export function CustomerSelect({ customers, selectedCustomer, onSelect }: CustomerSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.shortCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          value={selectedCustomer ? `${selectedCustomer.name} (${selectedCustomer.shortCode})` : searchTerm}
          onChange={(e) => {
            if (!selectedCustomer) {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }
          }}
          onClick={() => setIsOpen(!isOpen)}
          className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-10 pr-10"
          placeholder="Search customers..."
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        {selectedCustomer && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(null);
              setSearchTerm('');
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {isOpen && !selectedCustomer && filteredCustomers.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 shadow-lg rounded-md py-1 max-h-60 overflow-auto">
          {filteredCustomers.map((customer) => (
            <button
              key={customer.id}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center space-x-3"
              onClick={() => {
                onSelect(customer);
                setIsOpen(false);
                setSearchTerm('');
              }}
            >
              <Building2 className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {customer.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {customer.shortCode}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}