import React, { useState, useEffect } from 'react';
import { VpnProfile, VpnType, WireGuardConfig } from '../../types/vpn';
import { X } from 'lucide-react';

interface VpnModalProps {
  profile?: VpnProfile;
  customerId: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: Omit<VpnProfile, 'id' | 'createdAt' | 'encryptedPassword'> & { password: string }) => void;
}

const FormField: React.FC<{
  label: string;
  children: React.ReactNode;
  required?: boolean;
}> = ({ label, children, required }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
  </div>
);

export function VpnModal({ profile, customerId, isOpen, onClose, onSave }: VpnModalProps) {
  const [formData, setFormData] = useState<Omit<VpnProfile, 'id' | 'createdAt' | 'encryptedPassword'> & { password: string }>({
    customerId,
    name: '',
    type: 'cisco-anyconnect',
    hostname: '',
    port: 443,
    username: '',
    password: '',
    protocol: 'tcp',
    wireGuardConfig: {
      privateKey: '',
      publicKey: '',
      endpoint: '',
      allowedIPs: ['0.0.0.0/0'],
      persistentKeepalive: 25,
    },
  });

  useEffect(() => {
    if (profile) {
      const { id, createdAt, encryptedPassword, ...rest } = profile;
      setFormData({ ...rest, password: '' });
    } else {
      setFormData({
        customerId,
        name: '',
        type: 'cisco-anyconnect',
        hostname: '',
        port: 443,
        username: '',
        password: '',
        protocol: 'tcp',
        wireGuardConfig: {
          privateKey: '',
          publicKey: '',
          endpoint: '',
          allowedIPs: ['0.0.0.0/0'],
          persistentKeepalive: 25,
        },
      });
    }
  }, [profile, customerId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const isWireGuard = formData.type === 'wireguard';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {profile ? 'Edit VPN Profile' : 'Add New VPN Profile'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <FormField label="Profile Name" required>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
                required
              />
            </FormField>

            <FormField label="VPN Type" required>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as VpnType })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
              >
                <option value="cisco-anyconnect">Cisco AnyConnect</option>
                <option value="openvpn">OpenVPN</option>
                <option value="wireguard">WireGuard</option>
                <option value="local">Local Network</option>
              </select>
            </FormField>
          </div>

          {isWireGuard ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <FormField label="Private Key" required>
                  <input
                    type="password"
                    value={formData.wireGuardConfig?.privateKey || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      wireGuardConfig: {
                        ...formData.wireGuardConfig!,
                        privateKey: e.target.value,
                      },
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
                    required
                  />
                </FormField>

                <FormField label="Public Key" required>
                  <input
                    type="text"
                    value={formData.wireGuardConfig?.publicKey || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      wireGuardConfig: {
                        ...formData.wireGuardConfig!,
                        publicKey: e.target.value,
                      },
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
                    required
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <FormField label="Endpoint" required>
                  <input
                    type="text"
                    value={formData.wireGuardConfig?.endpoint || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      wireGuardConfig: {
                        ...formData.wireGuardConfig!,
                        endpoint: e.target.value,
                      },
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
                    required
                    placeholder="host:port"
                  />
                </FormField>

                <FormField label="Allowed IPs" required>
                  <input
                    type="text"
                    value={formData.wireGuardConfig?.allowedIPs.join(', ') || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      wireGuardConfig: {
                        ...formData.wireGuardConfig!,
                        allowedIPs: e.target.value.split(',').map(ip => ip.trim()),
                      },
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
                    required
                    placeholder="0.0.0.0/0, ::/0"
                  />
                </FormField>
              </div>

              <FormField label="Persistent Keepalive (seconds)">
                <input
                  type="number"
                  value={formData.wireGuardConfig?.persistentKeepalive || 25}
                  onChange={(e) => setFormData({
                    ...formData,
                    wireGuardConfig: {
                      ...formData.wireGuardConfig!,
                      persistentKeepalive: parseInt(e.target.value),
                    },
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
                  min="0"
                  max="3600"
                />
              </FormField>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <FormField label="Hostname" required>
                  <input
                    type="text"
                    value={formData.hostname}
                    onChange={(e) => setFormData({ ...formData, hostname: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
                    required
                  />
                </FormField>

                <FormField label="Port" required>
                  <input
                    type="number"
                    value={formData.port}
                    onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
                    required
                    min="1"
                    max="65535"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <FormField label="Protocol" required>
                  <select
                    value={formData.protocol}
                    onChange={(e) => setFormData({ ...formData, protocol: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
                  >
                    <option value="tcp">TCP</option>
                    <option value="udp">UDP</option>
                  </select>
                </FormField>

                <FormField label="Username" required>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
                    required
                  />
                </FormField>
              </div>

              <FormField label={profile ? 'New Password (leave empty to keep current)' : 'Password'} required={!profile}>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
                  required={!profile}
                />
              </FormField>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-6">
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