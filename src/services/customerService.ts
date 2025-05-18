import { Customer, CustomerUpdate, NewCustomer } from '../types/customer';
import { v4 as uuidv4 } from 'uuid';
import { api } from './api.service';

const CUSTOMERS_ENDPOINT = '/customers';

export const customerService = {
  getCustomers: async (): Promise<Customer[]> => {
    try {
      const response = await api.get(CUSTOMERS_ENDPOINT);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      throw new Error('Failed to fetch customers');
    }
  },

  getCustomerById: async (id: string): Promise<Customer> => {
    try {
      const response = await api.get(`${CUSTOMERS_ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch customer ${id}:`, error);
      throw new Error('Failed to fetch customer details');
    }
  },

  addCustomer: async (customer: NewCustomer): Promise<Customer> => {
    try {
      // We'll check for unique shortCode on the server, but we can also check locally
      const newCustomer: Customer = {
        ...customer,
        id: uuidv4(), // Let the backend generate the ID, but provide one if needed
        createdAt: new Date().toISOString(),
      };

      const response = await api.post(CUSTOMERS_ENDPOINT, newCustomer);
      return response.data;
    } catch (error: any) {
      console.error('Failed to add customer:', error);
      if (error.response?.data?.message === 'Short code already exists') {
        throw new Error('Short code must be unique');
      }
      throw new Error('Failed to add customer');
    }
  },

  updateCustomer: async (id: string, updates: CustomerUpdate): Promise<Customer> => {
    try {
      const response = await api.put(`${CUSTOMERS_ENDPOINT}/${id}`, updates);
      return response.data;
    } catch (error: any) {
      console.error(`Failed to update customer ${id}:`, error);
      if (error.response?.data?.message === 'Short code already exists') {
        throw new Error('Short code must be unique');
      }
      throw new Error('Failed to update customer');
    }
  },

  deleteCustomer: async (id: string): Promise<void> => {
    try {
      await api.delete(`${CUSTOMERS_ENDPOINT}/${id}`);
    } catch (error) {
      console.error(`Failed to delete customer ${id}:`, error);
      throw new Error('Failed to delete customer');
    }
  }
};
