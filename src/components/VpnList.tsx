import React, { useState } from 'react';
import { VpnProfile } from '../types/vpn';
import { Edit, Trash2, Network, PlayCircle, CheckCircle2, XCircle } from 'lucide-react';
import { CiscoIcon, FortinetIcon, OpenConnectIcon, WireGuardIcon, LocalNetworkIcon } from './icons/VpnIcons';
import { Toast } from './Toast';

interface VpnListProps {
  profiles: VpnProfile[];
  onEdit: (profile: VpnProfile) => void;
  onDelete: (id: string) => void;
}

export function VpnList({ profiles, onEdit, onDelete }: VpnListProps) {
  const [testStatus, setTestStatus] = useState<Record<string, 'loading' | 'success' | 'error' | null>>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const getVpnIcon = (type: VpnProfile['type']) => {
    switch (type) {
      case 'cisco-anyconnect':
        return <CiscoIcon />;
      case 'fortinet':
        return <FortinetIcon />;
      case 'openconnect':
        return <OpenConnectIcon />;
      case 'wireguard':
        return <WireGuardIcon />;
      case 'local':
        return <LocalNetworkIcon />;
      default:
        return <Network className="h-5 w-5" />;
    }
  };

  const handleTestVpn = async (profile: VpnProfile) => {
    setTestStatus(prev => ({ ...prev, [profile.id]: 'loading' }));
    
    try {
      // Simulate VPN test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const success = Math.random() > 0.3; // Simulate 70% success rate
      
      if (success) {
        setTestStatus(prev => ({ ...prev, [profile.id]: 'success' }));
        setToast({ message: `VPN test successful: ${profile.name}`, type: 'success' });
      } else {
        throw new Error('Connection failed');
      }
    } catch (error) {
      setTestStatus(prev => ({ ...prev, [profile.id]: 'error' }));
      setToast({ message: `VPN test failed: ${profile.name}`, type: 'error' });
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Host</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {profiles.map((profile) => (
              <tr key={profile.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    {getVpnIcon(profile.type)}
                    <span className="ml-2">{profile.type}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-900 dark:text-gray-100">{profile.name}</span>
                    {profile.isDefault && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                        Default
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {profile.type === 'local' ? 'Local Network' : `${profile.hostname}:${profile.port}`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {testStatus[profile.id] === 'loading' ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                  ) : testStatus[profile.id] === 'success' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : testStatus[profile.id] === 'error' ? (
                    <XCircle className="h-5 w-5 text-red-500" />
                  ) : null}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleTestVpn(profile)}
                    disabled={testStatus[profile.id] === 'loading'}
                    className="inline-flex items-center px-3 py-1 rounded-md text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/50 mr-2 disabled:opacity-50"
                    title="Test VPN Connection"
                  >
                    <PlayCircle className={`h-5 w-5 ${testStatus[profile.id] === 'loading' ? 'animate-pulse' : ''}`} />
                    <span className="ml-1">Test</span>
                  </button>
                  <button
                    onClick={() => onEdit(profile)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-2"
                    title="Edit VPN Profile"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onDelete(profile.id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    title="Delete VPN Profile"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}