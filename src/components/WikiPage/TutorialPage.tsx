import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface TutorialSection {
  id: string;
  title: string;
  content: string;
}

const tutorialSections: TutorialSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    content: `
### Welcome to the Image Assistant

This guide will help you get started with deploying and managing system images.

1. First, ensure you have network connectivity
2. Connect your device to the appropriate network port
3. Configure VPN settings if required
4. Start the PXE boot process
    `
  },
  {
    id: 'network-setup',
    title: 'Network Setup',
    content: `
### Network Configuration

Proper network setup is crucial for successful imaging:

- Connect the device to an available network port
- Ensure the port is configured for PXE boot
- Verify DHCP settings are correct
- Test network connectivity before proceeding
    `
  },
  {
    id: 'vpn-config',
    title: 'VPN Configuration',
    content: `
### VPN Setup

For remote imaging, you'll need to configure VPN:

1. Select the appropriate customer
2. Choose a VPN profile
3. Test the VPN connection
4. Verify remote network access
    `
  },
  {
    id: 'pxe-boot',
    title: 'PXE Boot Process',
    content: `
### PXE Boot Instructions

To start the PXE boot process:

1. Power on the device
2. Watch for the boot screen
3. Press the appropriate key (usually F12 or DEL)
4. Select network boot from the menu
5. Wait for the imaging process to begin
    `
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    content: `
### Common Issues and Solutions

If you encounter problems:

1. Check network cable connections
2. Verify DHCP server is responding
3. Ensure VPN connection is active
4. Confirm PXE boot is enabled in BIOS
5. Check for proper VLAN configuration
    `
  }
];

export function TutorialPage() {
  const [expandedSections, setExpandedSections] = useState<string[]>(['getting-started']);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(current =>
      current.includes(sectionId)
        ? current.filter(id => id !== sectionId)
        : [...current, sectionId]
    );
  };

  return (
    <div className="space-y-4">
      {tutorialSections.map((section) => (
        <div
          key={section.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow"
        >
          <button
            onClick={() => toggleSection(section.id)}
            className="w-full px-6 py-4 flex items-center justify-between text-left"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {section.title}
            </h2>
            {expandedSections.includes(section.id) ? (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-500" />
            )}
          </button>
          
          {expandedSections.includes(section.id) && (
            <div className="px-6 pb-4">
              <div className="prose dark:prose-invert max-w-none">
                {section.content}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}