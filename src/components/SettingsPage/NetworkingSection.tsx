import React, { useState, useEffect } from 'react';
import { networkService } from '../../services/networkService';
import { Save, Loader2, Network } from 'lucide-react';

interface NetworkInterface {
  name: string;
  info: {
    address: string;
    netmask: string;
    family: 'IPv4' | 'IPv6';
    mac: string;
    internal: boolean;
    cidr: string | null;
    gateway?: string;
    dhcp?: {
      enabled: boolean;
      range?: {
        start: string;
        end: string;
      };
    };
  };
}

export function NetworkingSection() {
  const [interfaces, setInterfaces] = useState<NetworkInterface[]>([]);
  const [selectedInterface, setSelectedInterface] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNetworkInterfaces();
  }, []);

  const loadNetworkInterfaces = async () => {
    try {
      setIsLoading(true);
      const data = await networkService.getNetworkInterfaces();
      const formattedInterfaces = Object.entries(data)
        .filter(([_, info]) => info[0].family === 'IPv4' && !info[0].internal)
        .map(([name, info]) => ({
          name,
          info: info[0]
        }));
      setInterfaces(formattedInterfaces);
      if (formattedInterfaces.length > 0 && !selectedInterface) {
        setSelectedInterface(formattedInterfaces[0].name);
      }
    } catch (err) {
      setError('Failed to load network interfaces');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedInterface) return;

    const iface = interfaces.find(i => i.name === selectedInterface);
    if (!iface) return;

    try {
      setIsSaving(true);
      await networkService.updateInterfaceConfig(selectedInterface, iface.info);
      setError(null);
    } catch (err) {
      setError('Failed to save network configuration');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const updateInterfaceConfig = (name: string, updates: Partial<NetworkInterface['info']>) => {
    setInterfaces(current =>
      current.map(iface =>
        iface.name === name
          ? { ...iface, info: { ...iface.info, ...updates } }
          : iface
      )
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500 dark:text-gray-400" />
        </div>
      </div>
    );
  }

  const selectedInterfaceData = interfaces.find(i => i.name === selectedInterface);

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Network Interfaces</h2>
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-12 gap-6">
          {/* Interface Selection */}
          <div className="col-span-12 md:col-span-3">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Select Interface
              </label>
              <div className="space-y-2">
                {interfaces.map((iface) => (
                  <button
                    key={iface.name}
                    onClick={() => setSelectedInterface(iface.name)}
                    className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      selectedInterface === iface.name
                        ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Network className="h-5 w-5 mr-2" />
                    {iface.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interface Configuration */}
          {selectedInterfaceData && (
            <div className="col-span-12 md:col-span-9 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    IP Address
                  </label>
                  <input
                    type="text"
                    value={selectedInterfaceData.info.address}
                    onChange={(e) => updateInterfaceConfig(selectedInterfaceData.name, { address: e.target.value })}
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subnet Mask
                  </label>
                  <input
                    type="text"
                    value={selectedInterfaceData.info.netmask}
                    onChange={(e) => updateInterfaceConfig(selectedInterfaceData.name, { netmask: e.target.value })}
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Gateway
                  </label>
                  <input
                    type="text"
                    value={selectedInterfaceData.info.gateway || ''}
                    onChange={(e) => updateInterfaceConfig(selectedInterfaceData.name, { gateway: e.target.value })}
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    MAC Address
                  </label>
                  <input
                    type="text"
                    value={selectedInterfaceData.info.mac}
                    readOnly
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm bg-gray-50 dark:bg-gray-600"
                  />
                </div>

                <div className="col-span-2">
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      checked={selectedInterfaceData.info.dhcp?.enabled || false}
                      onChange={(e) => updateInterfaceConfig(selectedInterfaceData.name, {
                        dhcp: { ...selectedInterfaceData.info.dhcp, enabled: e.target.checked }
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                      Enable DHCP Server
                    </label>
                  </div>

                  {selectedInterfaceData.info.dhcp?.enabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          DHCP Range Start
                        </label>
                        <input
                          type="text"
                          value={selectedInterfaceData.info.dhcp?.range?.start || ''}
                          onChange={(e) => updateInterfaceConfig(selectedInterfaceData.name, {
                            dhcp: {
                              ...selectedInterfaceData.info.dhcp,
                              range: {
                                ...selectedInterfaceData.info.dhcp?.range,
                                start: e.target.value
                              }
                            }
                          })}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          DHCP Range End
                        </label>
                        <input
                          type="text"
                          value={selectedInterfaceData.info.dhcp?.range?.end || ''}
                          onChange={(e) => updateInterfaceConfig(selectedInterfaceData.name, {
                            dhcp: {
                              ...selectedInterfaceData.info.dhcp,
                              range: {
                                ...selectedInterfaceData.info.dhcp?.range,
                                end: e.target.value
                              }
                            }
                          })}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}