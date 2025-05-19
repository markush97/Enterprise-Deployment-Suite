import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Device } from '../types/device';
import { deviceService } from '../services/deviceService';
import { customerService } from '../services/customerService';
import { DeviceModal } from './DeviceModal';
import { CustomerListSkeleton } from './CustomerSkeleton';
import { Plus, Server, Monitor, Edit, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function DeviceList() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  // Fetch devices
  const {
    data: devices = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['devices'],
    queryFn: deviceService.getDevices
  });

  // Fetch customers
  const {
    data: customers = []
  } = useQuery({
    queryKey: ['customers'],
    queryFn: customerService.getCustomers
  });

  // Add device mutation
  const addDeviceMutation = useMutation({
    mutationFn: deviceService.addDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      toast.success('Device added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add device');
    }
  });

  // Update device mutation
  const updateDeviceMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Device> }) =>
      deviceService.updateDevice(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      toast.success('Device updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update device');
    }
  });

  // Delete device mutation
  const deleteDeviceMutation = useMutation({
    mutationFn: deviceService.deleteDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      toast.success('Device deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete device');
    }
  });

  const handleAddDevice = async (deviceData: Omit<Device, 'id' | 'createdAt'>) => {
    try {
      await addDeviceMutation.mutateAsync(deviceData);
      setIsModalOpen(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleEditDevice = async (id: string, deviceData: Partial<Device>) => {
    try {
      await updateDeviceMutation.mutateAsync({ id, data: deviceData });
      setIsModalOpen(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleDeleteDevice = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this device?')) {
      try {
        await deleteDeviceMutation.mutateAsync(id);
      } catch (error) {
        // Error is handled by the mutation
      }
    }
  };

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

        {isError && (
          <div className="p-4 bg-red-50 dark:bg-red-900/30 border-b border-red-200 dark:border-red-800">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-sm text-red-600 dark:text-red-400">
                {error instanceof Error ? error.message : 'Failed to load devices'}
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline focus:outline-none"
            >
              Try again
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">OS Version</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Image</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {isLoading ? (
                <CustomerListSkeleton />
              ) : devices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center justify-center">
                      <Server className="h-12 w-12 text-gray-400 mb-3" />
                      <p className="text-lg font-medium">No devices found</p>
                      <p className="text-sm mt-1">Add your first device to get started</p>
                      <button
                        onClick={() => {
                          setSelectedDevice(null);
                          setIsModalOpen(true);
                        }}
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Device
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                devices.map((device) => (
                  <tr
                    key={device.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition duration-150 ease-in-out"
                    onClick={() => navigate(`/dashboard/devices/${device.id}`)}
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
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-900 dark:text-gray-100">{device.customer?.shortCode}</td>
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
                ))
              )}
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
        }}
      />
    </div>
  );
}
