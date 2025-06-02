import { useEffect, useState } from 'react';
import { useCustomers } from '../../hooks/useCustomers';
import { CustomerModal } from './CustomerModal.component';
import { Plus, Building2 } from 'lucide-react';
import { Customer } from '../../types/customer.interface';
import { EntityList, EntityListColumn, EntityListAction } from '../utils/EntityList';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ConfirmDeleteModal } from '../utils/ConfirmDeleteModal';

export function CustomerList() {
    const navigate = useNavigate();
    const { customerid } = useParams();
    const location = useLocation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const {
        customersQuery,
        addCustomerMutation,
        updateCustomerMutation,
        deleteCustomerMutation,
    } = useCustomers();

    const { data: customers = [], isLoading, isError, error, refetch } = customersQuery;

    // Modal open/close logic based on URL
    useEffect(() => {
        if (location.pathname.endsWith('/add')) {
            setSelectedCustomer(null);
            setIsModalOpen(true);
        } else {
            setIsModalOpen(false);
        }
    }, [location.pathname, customers, customerid]);

    // Handle adding customer
    const handleAddCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt'>) => {
        try {
            await addCustomerMutation.mutateAsync(customerData);
            setIsModalOpen(false);
        } catch (error) {
            // Error is already handled in the mutation
        }
    };

    // Handle editing customer
    const handleEditCustomer = async (id: string, customerData: Partial<Customer>) => {
        try {
            await updateCustomerMutation.mutateAsync({ id, data: customerData });
            setIsModalOpen(false);
        } catch (error) {
            // Error is already handled in the mutation
        }
    };

    // Customer-specific columns
    const columns: EntityListColumn<Customer>[] = [
        { label: 'Code', accessor: 'shortCode' },
        {
            label: 'Name', accessor: 'name', render: c => (
                <div className="flex items-center">
                    <Building2 className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{c.name}</div>
                    </div>
                </div>
            )
        },
        { label: 'Pulseway ID', accessor: 'rmmId' },
        { label: 'Created', render: c => new Date(c.createdAt).toLocaleDateString() },
    ];

    // Customer-specific actions
    const actions: EntityListAction<Customer>[] = [
        {
            label: 'Edit',
            onClick: (customer) => {
                setSelectedCustomer(customer);
                setIsModalOpen(true);
            },
        },
        {
            label: 'Delete',
            danger: true,
            onClick: (customer) => {
                setCustomerToDelete(customer);
            },
        },
    ];

    const handleConfirmDelete = async () => {
        if (!customerToDelete) return;
        setIsDeleting(true);
        try {
            await deleteCustomerMutation.mutateAsync(customerToDelete.id);
            setCustomerToDelete(null);
            customersQuery.refetch();
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <EntityList
                data={customers}
                columns={columns}
                actions={actions}
                onRowClick={customer => navigate(`/customers/${customer.id}`)}
                onAdd={() => navigate('/customers/add')}
                addLabel={"Add Customer"}
                title={<><Building2 className="h-6 w-6 text-gray-500 dark:text-gray-400" /><h2 className="text-xl font-semibold text-gray-900 dark:text-white">Customers</h2></>}
                emptyState={
                    <div className="flex flex-col items-center justify-center">
                        <Building2 className="h-12 w-12 text-gray-400 mb-3" />
                        <p className="text-lg font-medium">No customers found</p>
                        <p className="text-sm mt-1">Add your first customer to get started</p>
                        <button
                            onClick={() => {
                                setSelectedCustomer(null);
                                setIsModalOpen(true);
                            }}
                            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Customer
                        </button>
                    </div>
                }
                isLoading={isLoading}
                isError={isError}
                error={error instanceof Error ? error.message : undefined}
                onRetry={refetch}
            />
            <CustomerModal
                customer={selectedCustomer || undefined}
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedCustomer(null);
                    if (location.pathname.endsWith('/add')) {
                        navigate(-1);
                    } else {
                        setIsModalOpen(false);
                    }
                }}
                onSave={async (data) => {
                    if (selectedCustomer) {
                        await handleEditCustomer(selectedCustomer.id, data);
                    } else {
                        await handleAddCustomer(data);
                    }
                }}
            />
            <ConfirmDeleteModal
                isOpen={!!customerToDelete}
                title="Delete Customer"
                entityName={customerToDelete?.name || ''}
                onCancel={() => setCustomerToDelete(null)}
                onConfirm={handleConfirmDelete}
                isLoading={isDeleting}
            />
        </>
    );
}

