import { Monitor } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import useDevices from '../../hooks/useDevices';
import type { Device } from '../../types/device.interface';
import { EntityList, EntityListColumn } from '../utils/EntityList';

export function DeviceList() {
  const navigate = useNavigate();
  const { devicesQuery } = useDevices();
  const { data: devices = [], isLoading, isError, error, refetch } = devicesQuery;

  const columns: EntityListColumn<Device>[] = [
    { label: 'Name', accessor: 'name' },
    { label: 'Type', accessor: 'type' },
    { label: 'Serial Number', accessor: 'serialNumber' },
    { label: 'Asset Tag', accessor: 'assetTag' },
  ];

  return (
    <EntityList
      data={devices}
      columns={columns}
      actions={[]}
      onRowClick={device => navigate(`/devices/${device.id}`)}
      title={
        <>
          <Monitor className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Devices</h2>
        </>
      }
      emptyState={
        <div className="flex flex-col items-center justify-center">
          <Monitor className="h-12 w-12 text-gray-400 mb-3" />
          <p className="text-lg font-medium">No devices found</p>
        </div>
      }
      isLoading={isLoading}
      isError={isError}
      error={error instanceof Error ? error.message : undefined}
      onRetry={refetch}
    />
  );
}
