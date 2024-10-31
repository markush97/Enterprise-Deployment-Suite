import React, { useState } from 'react';
import { Customer } from '../types/customer';
import { VpnProfile } from '../types/vpn';
import { useVpnStore } from '../stores/vpnStore';
import { VpnList } from './VpnList';
import { VpnModal } from './VpnModal';
import { Plus, Network } from 'lucide-react';

interface CustomerVpnSectionProps {
  customer: Customer;
}

export function CustomerVpnSection({ customer }: CustomerVpnSectionProps) {
  const { profiles, addProfile, updateProfile, deleteProfile, setDefaultProfile } = useVpnStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<VpnProfile | undefined>();

  const customerProfiles = profiles.filter(profile => profile.customerId === customer.id);

  const handleAddVpn = () => {
    setSelectedProfile(undefined);
    setIsModalOpen(true);
  };

  const handleEditVpn = (profile: VpnProfile) => {
    setSelectedProfile(profile);
    setIsModalOpen(true);
  };

  const handleSaveVpn = async (profileData: Omit<VpnProfile, 'id' | 'createdAt'>) => {
    if (selectedProfile) {
      await updateProfile(selectedProfile.id, profileData);
    } else {
      await addProfile({ ...profileData, customerId: customer.id });
    }
    setIsModalOpen(false);
  };

  const handleDeleteVpn = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this VPN profile?')) {
      await deleteProfile(id);
    }
  };

  const handleSetDefault = async (profileId: string) => {
    await setDefaultProfile(customer.id, profileId);
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <Network className="h-5 w-5 text-gray-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">VPN Profiles</h3>
        </div>
        <button
          onClick={handleAddVpn}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add VPN Profile
        </button>
      </div>

      {customerProfiles.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <Network className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No VPN profiles</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by adding a new VPN profile.
          </p>
          <div className="mt-6">
            <button
              onClick={handleAddVpn}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add VPN Profile
            </button>
          </div>
        </div>
      ) : (
        <VpnList
          profiles={customerProfiles}
          onEdit={handleEditVpn}
          onDelete={handleDeleteVpn}
        />
      )}

      <VpnModal
        profile={selectedProfile}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveVpn}
        onSetDefault={handleSetDefault}
      />
    </div>
  );
}