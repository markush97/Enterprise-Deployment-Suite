import { create } from 'zustand';
import { Customer, CustomerState } from '../types/customer';
import { v4 as uuidv4 } from 'uuid';

// Mock customers data
const mockCustomers: Customer[] = [
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

export const useCustomerStore = create<CustomerState>((set) => ({
  customers: mockCustomers,
  isLoading: false,
  error: null,
  selectedCustomer: null,

  fetchCustomers: async () => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ customers: mockCustomers, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addCustomer: async (customer) => {
    set({ isLoading: true, error: null });
    try {
      const newCustomer: Customer = {
        ...customer,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
      };
      set(state => ({
        customers: [...state.customers, newCustomer],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateCustomer: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      set(state => ({
        customers: state.customers.map(c => 
          c.id === id ? { ...c, ...updates } : c
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  deleteCustomer: async (id) => {
    set({ isLoading: true, error: null });
    try {
      set(state => ({
        customers: state.customers.filter(c => c.id !== id),
        selectedCustomer: state.selectedCustomer?.id === id ? null : state.selectedCustomer,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  setSelectedCustomer: (customer) => {
    set({ selectedCustomer: customer });
  },
}));