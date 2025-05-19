import React from 'react';
import { Device } from '../types/device';
import { ChevronLeft, Server, Monitor, HardDrive, Key, Network, Image, Receipt, ReceiptText } from 'lucide-react';
import { customerService } from '../services/customerService';

interface DevicePageProps {
  device: Device;
  onBack: () => void;
  onDeviceDeleted?: () => void;
}

export function DevicePage({ device, onBack }: DevicePageProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              {device.type === 'server' ? (
                <Server className="h-8 w-8 text-blue-500" />
              ) : (
                <Monitor className="h-8 w-8 text-green-500" />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {device.name}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {device.type === 'server' ? 'Server' : 'Client'} Device ({device.customer?.shortCode})
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Device Information */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Device Information
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <Network className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">MAC Address</p>
                <p className="text-sm font-mono text-gray-900 dark:text-white">{device.macAddress}</p>
              </div>
            </div>

            {device.customer && (
              <a href={`https://cwi.eu.itglue.com/${device.customer.itGlueId}/configurations/${device.itGlueId}`}><div className="flex items-start space-x-3">
                <ReceiptText className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">ITGlue</p>
                  <p className="text-sm font-mono text-gray-900 dark:text-white">Link</p>
                </div>
              </div></a>
            )}

            <div className="flex items-start space-x-3">
              <HardDrive className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">OS Version</p>
                <p className="text-sm text-gray-900 dark:text-white">{device.osVersion}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Image className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">System Image</p>
                <p className="text-sm text-gray-900 dark:text-white">{device.imageName}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="h-5 w-5 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <span className="text-xs">@</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Created By</p>
                <p className="text-sm text-gray-900 dark:text-white">{device.createdBy}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="h-5 w-5 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <span className="text-xs">📅</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Created At</p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {new Date(device.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional sections can be added here */}
      {/* For example: Network Configuration, Storage Information, etc. */}
    </div>
  );
}
