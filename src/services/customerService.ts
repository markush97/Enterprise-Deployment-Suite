import { Customer } from '../types/customer';
import { v4 as uuidv4 } from 'uuid';

// Mock data
let mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Example Corp GmbH',
    shortCode: 'EXC',
    pulsewayId: 'PW123456',
    createdAt: '2024-03-15T10:00:00Z',
    settings: {
      defaultClientImage: 'Windows 11 Enterprise 22H2',
      defaultServerImage: 'Windows Server 2022',
    }
  },
  {
    id: '2',
    name: 'Tech Solutions AG',
    shortCode: 'TSA',
    pulsewayId: 'PW789012',
    createdAt: '2024-03-14T09:00:00Z',
    settings: {
      defaultClientImage: 'Windows 11 Enterprise 22H2',
      defaultServerImage: 'Windows Server 2022',
    }
  }
];

export const customerService = {
  getCustomers: async (): Promise<Customer[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockCustomers];
  },

  addCustomer: async (customer: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Validate shortCode uniqueness
    if (mockCustomers.some(c => c.shortCode === customer.shortCode)) {
      throw new Error('Short code must be unique');
    }

    const newCustomer: Customer = {
      ...customer,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };

    mockCustomers.push(newCustomer);
    return newCustomer;
  },

  updateCustomer: async (id: string, updates: Partial<Customer>): Promise<Customer> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = mockCustomers.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Customer not found');

    // Validate shortCode uniqueness if it's being updated
    if (updates.shortCode && 
        mockCustomers.some(c => c.shortCode === updates.shortCode && c.id !== id)) {
      throw new Error('Short code must be unique');
    }

    mockCustomers[index] = {
      ...mockCustomers[index],
      ...updates,
    };

    return mockCustomers[index];
  },

  deleteCustomer: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    mockCustomers = mockCustomers.filter(c => c.id !== id);
  }
};