import { useEffect, useRef, useState } from 'react';
import { useCustomers } from '../../hooks/useCustomers';
import { CustomerModal } from './CustomerModal.component';
import { Plus, Building2, AlertCircle } from 'lucide-react';
import { Customer } from '../../types/customer.interface';
import { ContextMenu } from '../utils/ContextMenu';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

export function CustomerList() {
    const navigate = useNavigate();
    const { customerid } = useParams();
    const location = useLocation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
    const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);

    const {
        customersQuery,
        addCustomerMutation,
        updateCustomerMutation,
        deleteCustomerMutation,
    } = useCustomers();

    const { data: customers = [], isLoading, isError, error, refetch } = customersQuery;

    // Close menu on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpenId(null);
            }
        }
        if (menuOpenId) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuOpenId]);

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

    // Render the context menu as a portal
    const menuEntries = menuOpenId
        ? [
            {
                label: 'Edit',
                onClick: () => {
                    const customer = customers.find((c: Customer) => c.id === menuOpenId);
                    setMenuOpenId(null);
                    setMenuPosition(null);
                    if (customer) {
                        setSelectedCustomer(customer);
                        setIsModalOpen(true);
                    }
                },
            },
            {
                label: 'Delete',
                danger: true,
                onClick: async () => {
                    const customer = customers.find((c: Customer) => c.id === menuOpenId);
                    setMenuOpenId(null);
                    setMenuPosition(null);
                    if (customer && window.confirm(`Delete customer '${customer.name}'? This action cannot be undone.`)) {
                        await deleteCustomerMutation.mutateAsync(customer.id);
                        customersQuery.refetch();
                    }
                },
            },
        ]
        : [];

    // Close modal on back navigation
    useEffect(() => {
        if (!isModalOpen) return;
        const handlePopState = () => {
            setIsModalOpen(false);
            setSelectedCustomer(null);
            // Prevent navigating away
            navigate(location.pathname, { replace: true });
        };
        window.addEventListener('popstate', handlePopState);
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [isModalOpen, navigate, location.pathname]);

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden transition-all duration-300">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <Building2 className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Customers
                            </h2>
                        </div>
                        <button
                            onClick={() => navigate('/customers/add')}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Customer
                        </button>
                    </div>
                </div>

                {isError && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/30 border-b border-red-200 dark:border-red-800">
                        <div className="flex items-center">
                            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                            <p className="text-sm text-red-600 dark:text-red-400">
                                {error instanceof Error ? error.message : 'Failed to load customers'}
                            </p>
                        </div>
                        <button
                            onClick={() => refetch()}
                            className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline focus:outline-none"
                        >
                            Try again
                        </button>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Code</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pulseway ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                            {isLoading ? null : customers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
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
                                    </td>
                                </tr>
                            ) : (
                                customers.map((customer: Customer) => (
                                    <tr
                                        key={customer.id}
                                        className="group hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition duration-150 ease-in-out"
                                        onClick={() => navigate(`/customers/${customer.id}`)}
                                    >
                                        <td className="px-6 py-4 w-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{customer.shortCode}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Building2 className="h-5 w-5 text-gray-400 mr-3" />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{customer.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{customer.rmmId}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(customer.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2 relative">
                                                <button
                                                    onClick={event => {
                                                        event.stopPropagation();
                                                        const rect = (event.target as HTMLElement).getBoundingClientRect();
                                                        if (menuOpenId === customer.id) {
                                                            setMenuOpenId(null);
                                                            setMenuPosition(null);
                                                        } else {
                                                            setMenuOpenId(customer.id);
                                                            setMenuPosition({
                                                                top: rect.bottom + window.scrollY,
                                                                left: rect.right - 160,
                                                            });
                                                        }
                                                    }}
                                                    className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none group-hover:bg-transparent"
                                                    title="Actions"
                                                >
                                                    <span className="sr-only">Actions</span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600 dark:text-gray-300">
                                                        <circle cx="12" cy="12" r="1.5" />
                                                        <circle cx="19" cy="12" r="1.5" />
                                                        <circle cx="5" cy="12" r="1.5" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    <ContextMenu
                        isOpen={!!menuOpenId}
                        anchorPosition={menuPosition}
                        entries={menuEntries}
                        onClose={() => {
                            setMenuOpenId(null);
                            setMenuPosition(null);
                        }}
                        menuRef={menuRef}
                        title="Actions"
                    />
                </div>
            </div>

            <CustomerModal
                customer={selectedCustomer || undefined}
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedCustomer(null);
                    // Use browser history to go back if modal was opened via URL
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
        </div>
    );
}

