import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import Tippy from '@tippyjs/react';

import { customerService } from '../../services/customer.service';
import { deviceService } from '../../services/device.service';
import type { Device } from '../../types/device.interface';
import type { Job } from '../../types/job.interface';

interface DeviceNameCardProps {
  job: Job;
  isJobStarted: boolean;
  onJobUpdated?: (job: Job) => void;
  customerOptions?: { id: string; name: string; shortCode: string }[];
}

export function JobDeviceInfoCard({ job, isJobStarted, onJobUpdated }: DeviceNameCardProps) {
  // Helper to get deviceId for API call
  const deviceId = job.device?.id;
  const [deviceName, setDeviceName] = useState(job.device?.name || '');
  const [autoName, setAutoName] = useState('');
  const [autoNameLoading, setAutoNameLoading] = useState(false);
  const [usedAutoName, setUsedAutoName] = useState(false);

  // Track selected device type for auto-naming
  const [selectedType, setSelectedType] = useState(job.device?.type || '');

  useEffect(() => {
    setDeviceName(job.device?.name || '');
    setSelectedType(job.device?.type || '');
    setAutoName('');
  }, [job.device]);

  // Use next device number from customer object if available
  const customerId = job.customer?.id;
  const customer = customerId
    ? Array.isArray(job.customer)
      ? job.customer.find((c: any) => c.id === customerId)
      : job.customer
    : undefined;

  // Dynamically update autoName when selectedType or customer changes
  useEffect(() => {
    const updateAutoName = async () => {
      if (!customerId || !selectedType) {
        setAutoName('');
        return;
      }
      setAutoNameLoading(true);
      try {
        let nextNumber: number | undefined;
        let typeKey = '';
        switch (selectedType) {
          case 'PC':
            typeKey = 'deviceCounterPc';
            break;
          case 'NB':
            typeKey = 'deviceCounterNb';
            break;
          case 'TAB':
            typeKey = 'deviceCounterTab';
            break;
          case 'MAC':
            typeKey = 'deviceCounterMac';
            break;
          case 'SRV':
            typeKey = 'deviceCounterSrv';
            break;
          case 'DIV':
            typeKey = 'deviceCounterDiv';
            break;
          default:
            typeKey = '';
        }
        if (customer && typeKey && typeof customer[typeKey] === 'number') {
          nextNumber = customer[typeKey] + 1;
        }
        if (nextNumber) {
          setAutoName(
            `${job.customer.shortCode}-${selectedType}${String(nextNumber).padStart(2, '0')}`,
          );
        }
      } catch (e) {
        setAutoName('');
      } finally {
        setAutoNameLoading(false);
      }
    };
    updateAutoName();
  }, [selectedType, customerId, customer, job.customer?.shortCode]);

  // Staged state for device name/type/assetTag
  const [stagedDeviceName, setStagedDeviceName] = useState(deviceName);
  const [stagedType, setStagedType] = useState(selectedType);
  const [stagedAssetTag, setStagedAssetTag] = useState((job.device as Device)?.assetTag || '');
  const [assetTagError, setAssetTagError] = useState<string | null>(null);
  useEffect(() => {
    setStagedDeviceName(deviceName);
    setStagedType(selectedType);
    setStagedAssetTag((job.device as Device)?.assetTag || '');
  }, [deviceName, selectedType, job.device]);

  const isStaged =
    stagedDeviceName !== (job.device?.name || '') ||
    stagedType !== (job.device?.type || '') ||
    stagedAssetTag !== ((job.device as Device)?.assetTag || '');

  // AssetTag validation
  const validateAssetTag = (value: string) => {
    if (!/^AS\d{4}$/.test(value)) {
      return 'AssetTag must start with "AS" followed by 4 digits (e.g. AS1234)';
    }
    return null;
  };

  // Placeholder logs array (replace with real logs from API or props)
  const [localPassword, setLocalPassword] = useState('');
  const [autogeneratePassword, setAutogeneratePassword] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg mt-6">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Device Information</h2>
      </div>
      <div className="px-6 py-4 flex flex-col gap-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Device Type
        </label>
        <select
          className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 mb-2"
          value={selectedType}
          onChange={e => {
            setSelectedType(e.target.value);
            if (!isJobStarted && onJobUpdated) {
              onJobUpdated({ ...job, device: { ...job.device, type: e.target.value } });
            }
            setAutoName(''); // clear auto-name when type changes
          }}
          disabled={isJobStarted}
        >
          <option value="">Select type...</option>
          <option value="PC">PC</option>
          <option value="NB">Notebook</option>
          <option value="TAB">Tablet</option>
          <option value="MAC">Mac</option>
          <option value="SRV">Server</option>
          <option value="DIV">Other</option>
        </select>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Device Name
        </label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          value={stagedDeviceName}
          onChange={e => setStagedDeviceName(e.target.value)}
          disabled={isJobStarted}
        />
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Asset Tag
        </label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          value={stagedAssetTag}
          onChange={e => {
            setStagedAssetTag(e.target.value.toUpperCase());
            setAssetTagError(validateAssetTag(e.target.value.toUpperCase()));
          }}
          maxLength={6}
          placeholder="AS1234"
          disabled={isJobStarted}
        />
        {assetTagError && <span className="text-xs text-red-500">{assetTagError}</span>}
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 mt-2">
          Local Password
        </label>
        <div className="flex items-center gap-2 mb-2">
          <input
            type="password"
            className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            value={localPassword}
            onChange={e => setLocalPassword(e.target.value)}
            disabled={isJobStarted || autogeneratePassword}
            placeholder="Set local password"
          />
          <label className="flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              checked={autogeneratePassword}
              onChange={e => setAutogeneratePassword(e.target.checked)}
              disabled={isJobStarted}
            />
            Autogenerate
          </label>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
          <div className="flex items-center gap-2">
            Auto-Name:
            <Tippy
              disabled={!!autoName}
              content="No name generation available without a customer set."
              placement="top"
            >
              <span className="text-sm text-gray-700 dark:text-gray-200 font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded border border-gray-200 dark:border-gray-600">
                {autoNameLoading ? 'Generating...' : autoName || 'No auto-name available'}
              </span>
            </Tippy>
            {autoName && (
              <button
                className="ml-2 px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                onClick={() => {
                  setStagedDeviceName(autoName);
                  setUsedAutoName(true);
                }}
                disabled={isJobStarted}
              >
                Use
              </button>
            )}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 sm:mt-0 sm:ml-2">
            The auto-generated name is based on the selected customer and device type, following
            your organization's naming convention.
          </span>
        </div>
        <button
          className="mt-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-400 transition disabled:opacity-50"
          onClick={async () => {
            if (!deviceId) {
              toast.error('Device ID not found.');
              return;
            }
            if (assetTagError) {
              toast.error(assetTagError);
              return;
            }
            if (usedAutoName && stagedDeviceName === autoName && customerId && stagedType) {
              try {
                await customerService.setDeviceCountersAndOUs(customerId, {
                  [`deviceCounter${stagedType.charAt(0).toUpperCase() + stagedType.slice(1).toLowerCase()}`]:
                    customer &&
                    typeof customer[
                      `deviceCounter${stagedType.charAt(0).toUpperCase() + stagedType.slice(1).toLowerCase()}`
                    ] === 'number'
                      ? customer[
                          `deviceCounter${stagedType.charAt(0).toUpperCase() + stagedType.slice(1).toLowerCase()}`
                        ] + 1
                      : 1,
                });
              } catch (e) {
                toast.error('Failed to increment device counter');
              }
            }
            setUsedAutoName(false);
            await toast.promise(
              (async () => {
                await deviceService.updateDevice(deviceId, {
                  name: stagedDeviceName,
                  type: stagedType,
                  assetTag: stagedAssetTag,
                  password: autogeneratePassword ? undefined : localPassword,
                  autogeneratePassword,
                });
                if (onJobUpdated) {
                  onJobUpdated({
                    ...job,
                    device: {
                      ...job.device,
                      name: stagedDeviceName,
                      type: stagedType,
                      assetTag: stagedAssetTag,
                    },
                  });
                }
                toast.success('Device updated successfully.');
              })(),
              {
                loading: 'Updating device...',
                success: 'Device updated successfully!',
                error: 'Failed to update device.',
              },
            );
          }}
          disabled={isJobStarted || !!assetTagError || !isStaged}
        >
          Save Device Info
        </button>
      </div>
    </div>
  );
}
