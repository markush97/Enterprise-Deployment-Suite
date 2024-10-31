import React, { useState } from 'react';
import { VpnProfile } from '../../types/vpn';
import { Edit, Trash2, PlayCircle, Network, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useVpnStore } from '../../stores/vpnStore';
import { Toast } from '../Toast';

interface VpnListProps {
  profiles: VpnProfile[];
  onEdit: (profile: VpnProfile) => void;
  onDelete: (id: string) => void;
}

const VpnTypeIcon = ({ type }: { type: VpnProfile['type'] }) => {
  switch (type) {
    case 'cisco-anyconnect':
      return (
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Cisco_logo.svg/128px-Cisco_logo.svg.png" 
          alt="Cisco"
          className="h-5 w-5"
        />
      );
    case 'fortinet':
      return (
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/6/62/Fortinet_logo.svg"
          alt="Fortinet"
          className="h-5 w-5"
        />
      );
    case 'wireguard':
      return (
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/9/98/Logo_wireguard.svg"
          alt="WireGuard"
          className="h-5 w-5"
        />
      );
    case 'openconnect':
      return (
        <img 
          src="https://gitlab.com/uploads/-/system/project/avatar/699/openconnect.png"
          alt="OpenConnect"
          className="h-5 w-5"
        />
      );
    case 'local':
      return <Network className="h-5 w-5 text-gray-500" />;
    default:
      return <Network className="h-5 w-5 text-gray-500" />;
  }
};

export function VpnList({ profiles, onEdit, onDelete }: VpnListProps) {
  const { testProfile, testingProfileId } = useVpnStore();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleTest = async (profile: VpnProfile) => {
    try {
      await testProfile(profile);
      setToast({ message: 'VPN test completed successfully', type: 'success' });
    } catch (error) {
      setToast({ message: error.message, type: 'error' });
    }
  };

  return (
    <div className="overflow-x-auto">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Configuration</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Test IP</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last Test</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
          {profiles.map((profile) => (
            <tr key={profile.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <VpnTypeIcon type={profile.type} />
                  <span className="ml-2 text-sm text-gray-900 dark:text-gray-100 capitalize">
                    {profile.type}
                  </span>
                  {profile.isDefault && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      Default
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{profile.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {profile.type === 'local' ? (
                  'Local Network'
                ) : (
                  <>
                    {profile.hostname}:{profile.port}
                    {profile.username && ` (${profile.username})`}
                  </>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{profile.testIp}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {profile.lastTestResult && (
                  <div className="flex items-center space-x-2">
                    {profile.lastTestResult.success ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <div className={`text-sm ${profile.lastTestResult.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {profile.lastTestResult.success ? 'Success' : 'Failed'}
                        {profile.lastTestResult.pingTime && ` (${profile.lastTestResult.pingTime}ms)`}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(profile.lastTestResult.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => handleTest(profile)}
                  disabled={testingProfileId === profile.id}
                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4 disabled:opacity-50"
                  title="Test VPN Connection"
                >
                  <PlayCircle className={`h-5 w-5 ${testingProfileId === profile.id ? 'animate-pulse' : ''}`} />
                </button>
                <button
                  onClick={() => onEdit(profile)}
                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
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
  );
}