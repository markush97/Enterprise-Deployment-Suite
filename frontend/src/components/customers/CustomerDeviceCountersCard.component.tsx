import { useState } from 'react';
import { customerService } from '../../services/customer.service';
import { toast } from 'react-hot-toast';
import type { Customer } from '../../types/customer.interface';

interface Props {
  customer: Customer;
  onCustomerUpdated?: (customer: Customer) => void;
}

export function CustomerDeviceCountersCard({ customer, onCustomerUpdated }: Props) {
  const [form, setForm] = useState<{
    deviceCounterPc: number;
    deviceOUPc: string;
    deviceCounterNb: number;
    deviceOUNb: string;
    deviceCounterTab: number;
    deviceOUTab: string;
    deviceCounterMac: number;
    deviceOUMac: string;
    deviceCounterSrv: number;
    deviceOUSrv: string;
    deviceCounterDiv: number;
    deviceOUDiv: string;
    [key: string]: string | number;
  }>({
    deviceCounterPc: customer.deviceCounterPc ?? 0,
    deviceOUPc: customer.deviceOUPc ?? '',
    deviceCounterNb: customer.deviceCounterNb ?? 0,
    deviceOUNb: customer.deviceOUNb ?? '',
    deviceCounterTab: customer.deviceCounterTab ?? 0,
    deviceOUTab: customer.deviceOUTab ?? '',
    deviceCounterMac: customer.deviceCounterMac ?? 0,
    deviceOUMac: customer.deviceOUMac ?? '',
    deviceCounterSrv: customer.deviceCounterSrv ?? 0,
    deviceOUSrv: customer.deviceOUSrv ?? '',
    deviceCounterDiv: customer.deviceCounterDiv ?? 0,
    deviceOUDiv: customer.deviceOUDiv ?? '',
  });
  const [loading, setLoading] = useState(false);
  const [usedAutoName, setUsedAutoName] = useState<{ [key: string]: boolean }>({});

  const handleUseAutoName = (counterKey: string, ouKey: string, autoName: string) => {
    setForm(f => ({ ...f, [ouKey]: autoName }));
    setUsedAutoName(u => ({ ...u, [counterKey]: true }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: name.startsWith('deviceCounter') ? Number(value) : value }));
    if (usedAutoName[name]) {
      setUsedAutoName(u => ({ ...u, [name]: false }));
    }
  };

  const handleSave = async () => {
    let updatedForm = { ...form };
    // For each device type, if the user used the auto-name and did not change it, increase the counter by one
    [
      { counter: 'deviceCounterPc', ou: 'deviceOUPc' },
      { counter: 'deviceCounterNb', ou: 'deviceOUNb' },
      { counter: 'deviceCounterTab', ou: 'deviceOUTab' },
      { counter: 'deviceCounterMac', ou: 'deviceOUMac' },
      { counter: 'deviceCounterSrv', ou: 'deviceOUSrv' },
      { counter: 'deviceCounterDiv', ou: 'deviceOUDiv' },
    ].forEach(({ counter, ou }) => {
      if (usedAutoName[counter] && form[ou] === (customer as any)[ou]) {
        updatedForm[counter] = Number(form[counter]) + 1;
      }
    });
    setLoading(true);
    try {
      const updated = await customerService.setDeviceCountersAndOUs(customer.id, updatedForm);
      toast.success('Device counters and OUs updated');
      if (onCustomerUpdated) onCustomerUpdated(updated);
      setUsedAutoName({});
    } catch (e: any) {
      toast.error(e.message || 'Failed to update device counters/OUs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg mt-6">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Device Counters &amp; OUs</h2>
      </div>
      <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: 'PC', counter: 'deviceCounterPc', ou: 'deviceOUPc' },
          { label: 'Notebook', counter: 'deviceCounterNb', ou: 'deviceOUNb' },
          { label: 'Tablet', counter: 'deviceCounterTab', ou: 'deviceOUTab' },
          { label: 'Mac', counter: 'deviceCounterMac', ou: 'deviceOUMac' },
          { label: 'Server', counter: 'deviceCounterSrv', ou: 'deviceOUSrv' },
          { label: 'Other', counter: 'deviceCounterDiv', ou: 'deviceOUDiv' },
        ].map(({ label, counter, ou }) => {
          const autoName = (customer as any)[ou] || '';
          return (
            <div key={label} className="flex flex-col md:flex-row md:items-center gap-2">
              <span className="w-24 font-medium text-gray-700 dark:text-gray-300">{label}</span>
              <input
                type="number"
                name={counter}
                min={0}
                className="w-24 px-2 py-1 border rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                value={form[counter]}
                onChange={handleChange}
                disabled={loading}
              />
              <input
                type="text"
                name={ou}
                placeholder="OU"
                className="flex-1 px-2 py-1 border rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                value={form[ou]}
                onChange={handleChange}
                disabled={loading}
              />
              <button
                className="ml-2 px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                onClick={() => handleUseAutoName(counter, ou, autoName)}
                disabled={loading}
                type="button"
              >
                Use
              </button>
            </div>
          );
        })}
        <div className="col-span-full flex justify-end mt-4">
          <button
            className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-400 transition disabled:opacity-50"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
