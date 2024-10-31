import React, { useState, useEffect } from 'react';
import { VpnProfile, VpnType } from '../types/vpn';
import { X, Network } from 'lucide-react';

interface VpnModalProps {
  profile?: VpnProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: Omit<VpnProfile, 'id' | 'createdAt'>) => void;
  onSetDefault: (profileId: string) => void;
}

export function VpnModal({ profile, isOpen, onClose, onSave, onSetDefault }: VpnModalProps) {
  const [formData, setFormData] = useState<Omit<VpnProfile, 'id' | 'createdAt'>>({
    customerId: '',
    name: '',
    type: 'cisco-anyconnect',
    hostname: '',
    port: 443,
    username: '',
    encryptedPassword: '',
    protocol: 'tcp',
    testIp: '',
    isDefault: false,
  });

  useEffect(() => {
    if (profile) {
      const { id, createdAt, ...rest } = profile;
      setFormData(rest);
    } else {
      setFormData({
        customerId: '',
        name: '',
        type: 'cisco-anyconnect',
        hostname: '',
        port: 443,
        username: '',
        encryptedPassword: '',
        protocol: 'tcp',
        testIp: '',
        isDefault: false,
      });
    }
  }, [profile]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const vpnTypes: { value: VpnType; label: string }[] = [
    { value: 'cisco-anyconnect', label: 'Cisco AnyConnect' },
    { value: 'openconnect', label: 'OpenConnect' },
    { value: 'fortinet', label: 'Fortinet' },
    { value: 'wireguard', label: 'WireGuard' },
    { value: 'local', label: 'Local Network' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {profile ? 'Edit VPN Profile' : 'Add New VPN Profile'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Profile Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                VPN Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as VpnType })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {vpnTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {formData.type !== 'local' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Protocol
                  </label>
                  <select
                    value={formData.protocol}
                    onChange={(e) => setFormData({ ...formData, protocol: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="tcp">TCP</option>
                    <option value="udp">UDP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Hostname
                  </label>
                  <input
                    type="text"
                    value={formData.hostname}
                    onChange={(e) => setFormData({ ...formData, hostname: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Port
                  </label>
                  <input
                    type="number"
                    value={formData.port}
                    onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Test IP
                  </label>
                  <input
                    type="text"
                    value={formData.testIp}
                    onChange={(e) => setFormData({ ...formData, testIp: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                    pattern="^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$"
                    placeholder="192.168.1.1"
                  />
                </div>

                {formData.type !== 'wireguard' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Username
                      </label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Password
                      </label>
                      <input
                        type="password"
                        onChange={(e) => setFormData({ ...formData, encryptedPassword: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required={!profile}
                        placeholder={profile ? '••••••••' : ''}
                      />
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          <div className="pt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                Set as default VPN profile
              </span>
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {profile ? 'Save Changes' : 'Add Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}