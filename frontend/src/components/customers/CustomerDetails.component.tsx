import React, { useState } from 'react';
import { Customer } from '../types/customer';
import { VpnProfile } from '../types/vpn';
import { useVpnStore } from '../stores/vpnStore';
import { VpnList } from './VpnList';
import { VpnModal } from './VpnModal';
import { Plus, Network } from 'lucide-react';

interface CustomerDetailsProps {
  customer: Customer;
}

export function CustomerDetails({ customer }: CustomerDetailsProps) {
  const [isVpnModalOpen, setIsVpnModalOpen] = useState(false);
  const [selectedVpnProfile, setSelectedVpnProfile] = useState<VpnProfile | undefined>();
  
  const {
    profiles: vpnProfiles,
    addProfile: addVpnProfile,
    updateProfile: updateVpnProfile,
    deleteProfile: deleteVpnProfile,
  } = useVpnStore();

  const customerVpnProfiles = vpnProfiles.filter(profile => profile.customerId === customer.id);

  const handleAddVpnProfile = () => {
    setSelectedVpnProfile(undefined);
    setIsVpnModalOpen(true);
  };

  const handleEditVpnProfile = (profile: VpnProfile) => {
    setSelectedVpnProfile(profile);
    setIsVpnModalOpen(true);
  };

  const handleSaveVpnProfile = async (profileData: Omit<VpnProfile, 'id' | 'createdAt' | 'encryptedPassword'> & { password: string }) => {
    if (selectedVpnProfile) {
      await updateVpnProfile(selectedVpnProfile.id, profileData);
    } else {
      await addVpnProfile(profileData);
    }
    setIsVpnModalOpen(false);
  };

  const handleDeleteVpnProfile = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this VPN profile?')) {
      await deleteVpnProfile(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img
            src="https://cwi.at/wp-content/uploads/2022/11/cwi-logo-1.svg"
            alt="CWI Logo"
            className="h-8"
          />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {customer.name} ({customer.shortCode})
          </h2>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Network className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                VPN Profiles
              </h3>
            </div>
            <button
              onClick={handleAddVpnProfile}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add VPN Profile
            </button>
          </div>
        </div>

        <VpnList
          profiles={customerVpnProfiles}
          onEdit={handleEditVpnProfile}
          onDelete={handleDeleteVpnProfile}
        />
      </div>

      <VpnModal
        profile={selectedVpnProfile}
        customerId={customer.id}
        isOpen={isVpnModalOpen}
        onClose={() => setIsVpnModalOpen(false)}
        onSave={handleSaveVpnProfile}
      />
    </div>
  );
}