import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Customer } from '../types/customer.interface';
import { customerService } from '../services/customer.service';

export function useCustomers() {
    const queryClient = useQueryClient();

    // Fetch customers
    const customersQuery = useQuery({
        queryKey: ['customers'],
        queryFn: customerService.getCustomers
    });

    // Add customer mutation
    const addCustomerMutation = useMutation({
        mutationFn: customerService.addCustomer,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            toast.success('Customer added successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to add customer');
            throw error;
        }
    });

    // Update customer mutation
    const updateCustomerMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: Partial<Customer> }) =>
            customerService.updateCustomer(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            toast.success('Customer updated successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update customer');
            throw error;
        }
    });

    // Delete customer mutation
    const deleteCustomerMutation = useMutation({
        mutationFn: customerService.deleteCustomer,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            toast.success('Customer deleted successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to delete customer');
            throw error;
        }
    });

    return {
        customersQuery,
        addCustomerMutation,
        updateCustomerMutation,
        deleteCustomerMutation,
    };
}
