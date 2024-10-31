import React, { useState, useEffect } from 'react';
import { Device } from '../types/device';
import { Customer } from '../types/customer';
import { deviceService } from '../services/deviceService';
import { customerService } from '../services/customerService';
import { DeviceModal } from './DeviceModal';
import { DevicePage } from './DevicePage';
import { Plus, Server, Monitor, Edit, Trash2 } from 'lucide-react';

export function DeviceList() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [devicesData, customersData] = await Promise.all([
        deviceService.getDevices(),
        customerService.getCustomers(),
      ]);
      setDevices(devicesData);
      setCustomers(customersData);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDevice = async (deviceData: Omit<Device, 'id' | 'createdAt'>) => {
    try {
      await deviceService.addDevice(deviceData);
      await loadData();
    } catch (err) {
      throw err;
    }
  };

  const handleEditDevice = async (id: string, deviceData: Partial<Device>) => {
    try {
      await deviceService.updateDevice(id, deviceData);
      await loadData();
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteDevice = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this device?')) {
      try {
        await deviceService.deleteDevice(id);
        await loadData();
      } catch (err) {
        setError('Failed to delete device');
      }
    }
  };

  if (showDetails && selectedDevice) {
    return (
      <DevicePage 
        device={selectedDevice}
        onBack={() => {
          setShowDetails(false);
          setSelectedDevice(null);
        }}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Server className="h-6 w-6 text-gray-500 dark:text-gray-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Devices
              </h2>
            </div>
            <button
              onClick={() => {
                setSelectedDevice(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Device
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/50 border-b border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">MAC Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">OS Version</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Image</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {devices.map((device) => (
                <tr 
                  key={device.id} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => {
                    setSelectedDevice(device);
                    setShowDetails(true);
                  }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {device.type === 'server' ? (
                        <Server className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      ) : (
                        <Monitor className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      )}
                      <span className="ml-2 text-sm text-gray-900 dark:text-gray-100 capitalize">
                        {device.type}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{device.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-900 dark:text-gray-100">{device.macAddress}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{device.osVersion}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{device.imageName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDevice(device);
                        setIsModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDevice(device.id);
                      }}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <DeviceModal
        device={selectedDevice || undefined}
        customers={customers}
        currentUser="admin@cwi.at"
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDevice(null);
        }}
        onSave={async (data) => {
          if (selectedDevice) {
            await handleEditDevice(selectedDevice.id, data);
          } else {
            await handleAddDevice(data);
          }
          setIsModalOpen(false);
          setSelectedDevice(null);
        }}
      />
    </div>
  );
}