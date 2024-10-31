import React, { useState, useEffect } from 'react';
import { X, Network, Laptop, ArrowRight, ArrowLeft, Loader2, Monitor, Server, Tablet, Smartphone, HelpCircle } from 'lucide-react';
import { useNetworkStore } from '../../stores/networkStore';
import { useCustomerStore } from '../../stores/customerStore';
import { useVpnStore } from '../../stores/vpnStore';
import { CustomerSelect } from './CustomerSelect';
import { NetworkSelect } from './NetworkSelect';
import Lottie from 'react-lottie-player';
import networkAnimation from '../../assets/animations/network-connection.json';
import bootAnimation from '../../assets/animations/computer-boot.json';
import successAnimation from '../../assets/animations/success.json';
import { Customer } from '../../types/customer';
import { VpnProfile } from '../../types/vpn';
import { useJobStore } from '../../stores/jobStore';

interface DeviceImagingWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

type DeviceType = 'PC' | 'NB' | 'TAB' | 'MAC' | 'SRV' | 'DIV';

export function DeviceImagingWizard({ isOpen, onClose }: DeviceImagingWizardProps) {
  const [step, setStep] = useState(1);
  const [selectedPort, setSelectedPort] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedVpn, setSelectedVpn] = useState<VpnProfile | null>(null);
  const [deviceType, setDeviceType] = useState<DeviceType>('NB');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const { interfaces, fetchInterfaces } = useNetworkStore();
  const { customers, fetchCustomers } = useCustomerStore();
  const { profiles: vpnProfiles } = useVpnStore();
  const { addJob } = useJobStore();

  useEffect(() => {
    if (isOpen) {
      fetchInterfaces();
      fetchCustomers();
    }
  }, [isOpen, fetchInterfaces, fetchCustomers]);

  const deviceTypes: { value: DeviceType; label: string; icon: React.ReactNode; description: string }[] = [
    { 
      value: 'PC', 
      label: 'Desktop', 
      icon: <Monitor className="h-8 w-8" />,
      description: 'Standard desktop workstation'
    },
    { 
      value: 'NB', 
      label: 'Notebook', 
      icon: <Laptop className="h-8 w-8" />,
      description: 'Portable laptop computer'
    },
    { 
      value: 'TAB', 
      label: 'Tablet', 
      icon: <Tablet className="h-8 w-8" />,
      description: 'Tablet device'
    },
    { 
      value: 'MAC', 
      label: 'Mac', 
      icon: <Monitor className="h-8 w-8" />,
      description: 'Apple Mac device'
    },
    { 
      value: 'SRV', 
      label: 'Server', 
      icon: <Server className="h-8 w-8" />,
      description: 'Server system'
    },
    { 
      value: 'DIV', 
      label: 'Sonstiges', 
      icon: <HelpCircle className="h-8 w-8" />,
      description: 'Other device types'
    },
  ];

  const mockImages = [
    { 
      id: '1', 
      name: 'Windows 11 Enterprise 22H2', 
      description: 'Latest Windows 11 build with all updates',
      icon: <Monitor className="h-8 w-8" />,
      size: '4.7 GB',
      lastUpdated: '2024-03-15'
    },
    { 
      id: '2', 
      name: 'Windows Server 2022', 
      description: 'Standard server image with core roles',
      icon: <Server className="h-8 w-8" />,
      size: '5.2 GB',
      lastUpdated: '2024-03-14'
    },
    { 
      id: '3', 
      name: 'macOS Sonoma', 
      description: 'Latest macOS for Apple devices',
      icon: <Monitor className="h-8 w-8" />,
      size: '12.1 GB',
      lastUpdated: '2024-03-13'
    },
  ];

  const getVpnProfiles = (customerId: string) => {
    return [
      {
        id: 'local',
        customerId,
        name: 'Local Network',
        type: 'local' as const,
        hostname: '',
        port: 0,
        username: '',
        encryptedPassword: '',
        protocol: '',
        testIp: '',
        createdAt: new Date().toISOString(),
      },
      ...vpnProfiles.filter(p => p.customerId === customerId),
    ];
  };

  useEffect(() => {
    if (step === 4 && !isRegistered) {
      setIsRegistering(true);
      // Simulate DHCP registration
      const timer = setTimeout(() => {
        setIsRegistered(true);
        setIsRegistering(false);
        
        // Create job when device is registered
        if (selectedCustomer) {
          const deviceNumber = Math.floor(Math.random() * 999) + 1;
          const deviceName = `${selectedCustomer.shortCode}-${deviceType}-${String(deviceNumber).padStart(3, '0')}`;
          
          addJob({
            deviceName,
            customerName: selectedCustomer.name,
            imageName: mockImages.find(img => img.id === selectedImage)?.name || '',
            status: 'preparing'
          });
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step, isRegistered, selectedCustomer, deviceType, selectedImage, addJob]);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-6">
              <div className="flex-shrink-0 w-1/3">
                <Lottie
                  loop
                  animationData={networkAnimation}
                  play
                  style={{ width: 200, height: 200 }}
                />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Connect the Device
                </h3>
                <div className="prose dark:prose-invert">
                  <ol className="space-y-4">
                    <li>Locate a free network port on the system</li>
                    <li>Connect the device's network cable to the chosen port</li>
                    <li>Note the port number for the next step</li>
                    <li>Ensure the connection is secure</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Network Port
                </label>
                <NetworkSelect
                  interfaces={interfaces}
                  selectedInterface={selectedPort}
                  onSelect={setSelectedPort}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Customer
                </label>
                <CustomerSelect
                  customers={customers}
                  selectedCustomer={selectedCustomer}
                  onSelect={setSelectedCustomer}
                />
              </div>

              {selectedCustomer && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    VPN Profile
                  </label>
                  <select
                    value={selectedVpn?.id || ''}
                    onChange={(e) => {
                      const profile = getVpnProfiles(selectedCustomer.id)
                        .find(p => p.id === e.target.value);
                      setSelectedVpn(profile || null);
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a VPN profile</option>
                    {getVpnProfiles(selectedCustomer.id).map((profile) => (
                      <option key={profile.id} value={profile.id}>
                        {profile.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Device Information
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {deviceTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setDeviceType(type.value)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    deviceType === type.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/50'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800'
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`mb-2 ${
                      deviceType === type.value
                        ? 'text-blue-500'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      {type.icon}
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {type.label}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {type.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Select System Image
              </h4>
              <div className="space-y-4">
                {mockImages.map((image) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(image.id)}
                    className={`w-full p-4 rounded-lg border-2 transition-all ${
                      selectedImage === image.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/50'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 ${
                        selectedImage === image.id
                          ? 'text-blue-500'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}>
                        {image.icon}
                      </div>
                      <div className="ml-4 text-left">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {image.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {image.description}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          Size: {image.size} • Last updated: {image.lastUpdated}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-6">
              <div className="flex-shrink-0 w-1/3">
                <Lottie
                  loop
                  animationData={bootAnimation}
                  play
                  style={{ width: 200, height: 200 }}
                />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Start PXE Boot
                </h3>
                <div className="prose dark:prose-invert">
                  <ol className="space-y-4">
                    <li>Power on the device</li>
                    <li>
                      Watch for the boot screen and press the appropriate key:
                      <ul className="mt-2">
                        <li>Lenovo devices: Press <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Enter</kbd></li>
                        <li>Other devices: Try <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">F12</kbd>, <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">F8</kbd>, <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">F1</kbd>, or <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Del</kbd></li>
                      </ul>
                    </li>
                    <li>Select "Network Boot" or "PXE Boot" from the boot menu</li>
                    <li>Wait for the network boot process to begin</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center py-12">
              {isRegistering ? (
                <>
                  <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Waiting for Device to Register...
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    This may take a few moments
                  </p>
                </>
              ) : (
                <>
                  <div className="text-green-500 mb-4">
                    <Lottie
                      loop={false}
                      animationData={successAnimation}
                      play
                      style={{ width: 200, height: 200 }}
                    />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Device Successfully Registered!
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    The imaging process will begin shortly
                  </p>
                </>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Device Imaging Wizard
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Steps indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              <div className={`flex items-center ${step === 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <span className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  step === 1 ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
                }`}>
                  <Network className="h-4 w-4" />
                </span>
                <span className="ml-2 font-medium">Connect</span>
              </div>
              <div className="flex-1 h-px bg-gray-300"></div>
              <div className={`flex items-center ${step === 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <span className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  step === 2 ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
                }`}>
                  <Monitor className="h-4 w-4" />
                </span>
                <span className="ml-2 font-medium">Device</span>
              </div>
              <div className="flex-1 h-px bg-gray-300"></div>
              <div className={`flex items-center ${step === 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                <span className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  step === 3 ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
                }`}>
                  <Laptop className="h-4 w-4" />
                </span>
                <span className="ml-2 font-medium">Boot</span>
              </div>
              <div className="flex-1 h-px bg-gray-300"></div>
              <div className={`flex items-center ${step === 4 ? 'text-blue-600' : 'text-gray-400'}`}>
                <span className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  step === 4 ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
                }`}>
                  <Loader2 className="h-4 w-4" />
                </span>
                <span className="ml-2 font-medium">Register</span>
              </div>
            </div>
          </div>

          {renderStep()}
        </div>

        <div className="flex justify-between items-center p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <button
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </button>
          <button
            onClick={() => {
              if (step < 4) {
                setStep(step + 1);
              } else if (isRegistered) {
                // Handle job creation and close
                onClose();
              }
            }}
            disabled={
              (step === 1 && (!selectedPort || !selectedCustomer || !selectedVpn)) ||
              (step === 2 && (!deviceType || !selectedImage)) ||
              (step === 4 && !isRegistered)
            }
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {step < 3 ? (
              <>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            ) : step === 3 ? (
              'Start'
            ) : (
              'Finish'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}