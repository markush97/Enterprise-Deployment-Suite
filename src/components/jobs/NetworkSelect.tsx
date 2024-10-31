import React from 'react';
import { NetworkInterface } from '../../types/network';
import { Network } from 'lucide-react';

interface NetworkSelectProps {
  interfaces: NetworkInterface[];
  selectedInterface: string;
  onSelect: (interfaceName: string) => void;
}

export function NetworkSelect({ interfaces, selectedInterface, onSelect }: NetworkSelectProps) {
  return (
    <div className="space-y-2">
      {interfaces.map((iface) => (
        <button
          key={iface.name}
          onClick={() => onSelect(iface.name)}
          className={`w-full flex items-center px-4 py-3 rounded-md border ${
            selectedInterface === iface.name
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
              : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <Network className="h-5 w-5 mr-3 text-gray-400" />
          <div className="text-left">
            <div className="font-medium">{iface.name}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {iface.info.address} ({iface.info.mac})
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}