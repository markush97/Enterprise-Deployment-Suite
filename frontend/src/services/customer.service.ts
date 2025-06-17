// src/services/customer.service.ts
import { api } from '../api/api.service';
import type { Customer } from '../types/customer.interface';

export const customerService = {
    async getCustomers(): Promise<Customer[]> {
        const res = await api.get<Customer[]>('/customers');
        return res.data;
    },
    async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
        const res = await api.patch<Customer>(`/customers/${id}`, data);
        return res.data;
    },
    async deleteCustomer(id: string): Promise<void> {
        await api.delete(`/customers/${id}`);
    },
    async addCustomer(data: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
        const res = await api.post<Customer>('/customers', data);
        return res.data;
    },
    async setDeviceCountersAndOUs(id: string, data: Partial<Customer>) {
        const res = await api.put<Customer>(`/customers/${id}/device-counters`, data);
        return res.data;
    },
    async getNextDeviceNumber(customerId: string, type: string): Promise<{ nextNumber: number }> {
        const res = await api.get<{ nextNumber: number }>(`/customers/${customerId}/next-device-number?type=${type}`);
        return res.data;
    },
};
