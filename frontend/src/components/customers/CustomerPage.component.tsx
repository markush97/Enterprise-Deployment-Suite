import { useState, useEffect } from 'react';
import { CustomerModal } from './CustomerModal.component';
import { ArrowLeft, Building2, Trash2, AlertCircle, Edit } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { customerService } from '../../services/customer.service';
import { Customer } from '../../types/customer.interface';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { useNavigate } from 'react-router-dom';

interface CustomerPageProps {
    customer: Customer;
    onBack: () => void;
    onCustomerUpdated?: (customer: Customer) => void;
    onCustomerDeleted?: () => void;
}

export function CustomerPage({ customer, onBack, onCustomerUpdated, onCustomerDeleted, editMode }: CustomerPageProps & { editMode?: boolean }) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    useEffect(() => {
        setIsEditModalOpen(!!editMode);
    }, [editMode]);
    // Close modal on browser back if editMode was true and url changes
    useEffect(() => {
        if (!isEditModalOpen) return;
        const handlePopState = () => {
            if (editMode && !window.location.pathname.endsWith('/edit')) {
                setIsEditModalOpen(false);
            }
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [isEditModalOpen, editMode]);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const navigate = useNavigate();


    const handleEditCustomer = async (data: Partial<Customer>): Promise<void> => {
        try {
            const updatedCustomer = await customerService.updateCustomer(customer.id, data);
            if (onCustomerUpdated) {
                onCustomerUpdated(updatedCustomer);
            }
            toast.success('Customer updated successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to update customer');
            throw error;
        }
    };

    const handleDeleteCustomer = async () => {
        try {
            setIsDeleting(true);
            await customerService.deleteCustomer(customer.id);
            toast.success('Customer deleted successfully');
            if (onCustomerDeleted) {
                onCustomerDeleted();
            }
            onBack();
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete customer');
        } finally {
            setIsDeleting(false);
            setIsDeleteConfirmOpen(false);
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center mb-6">
                <button
                    onClick={() => onBack()}
                    className="inline-flex items-center mr-4 px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Customers
                </button>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {customer.name}
                </h1>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <Building2 className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Customer Details
                        </h2>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => navigate(`/customers/${customer.id}/edit`)}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2"
                        >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                        </button>

                        <button
                            onClick={() => setIsDeleteConfirmOpen(true)}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            <Trash2 className="h-4 w-4 mr-1 text-red-500" />
                            Delete
                        </button>
                    </div>
                </div>

                <div className="px-6 py-4">
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                        <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Name
                            </dt>
                            <dd className="mt-1 text-lg text-gray-900 dark:text-white">
                                {customer.name}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Short Code
                            </dt>
                            <dd className="mt-1 text-lg text-gray-900 dark:text-white">
                                {customer.shortCode}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Pulseway ID
                            </dt>
                            <dd className="mt-1 text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                {customer.rmmId ? (
                                    <Tippy content="Open in Pulseway">
                                        <a
                                            href={`${window.PULSEWAY_URL_PREFIX || 'https://my.pulseway.com/'}?customerId=${customer.rmmId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 dark:text-blue-400 underline cursor-pointer font-normal"
                                            style={{ marginLeft: 0, fontSize: 'inherit', lineHeight: 'inherit' }}
                                        >
                                            {customer.rmmId}
                                        </a>
                                    </Tippy>
                                ) : (
                                    <span>{customer.rmmId}</span>
                                )}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Zoho ID
                            </dt>
                            <dd className="mt-1 text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                {customer.zohoId ? (
                                    <Tippy content="Open in Zoho Desk">
                                        <a
                                            href={`${window.ZOHO_URL_PREFIX || 'https://support.cwi.at/agent/cwiit/cwi/kunden/details/'}${customer.zohoId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 dark:text-blue-400 underline cursor-pointer font-normal"
                                            style={{ marginLeft: 0, fontSize: 'inherit', lineHeight: 'inherit' }}
                                        >
                                            {customer.zohoId}
                                        </a>
                                    </Tippy>
                                ) : (
                                    <span>{customer.zohoId}</span>
                                )}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                IT-Glue ID
                            </dt>
                            <dd className="mt-1 text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                {customer.itGlueId ? (
                                    <Tippy content="Open in IT-Glue">
                                        <a
                                            href={`${window.ITGLUE_URL_PREFIX || 'https://cwi.eu.itglue.com/'}${customer.itGlueId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 dark:text-blue-400 underline cursor-pointer font-normal"
                                            style={{ marginLeft: 0, fontSize: 'inherit', lineHeight: 'inherit' }}
                                        >
                                            {customer.itGlueId}
                                        </a>
                                    </Tippy>
                                ) : (
                                    <span>{customer.itGlueId}</span>
                                )}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Created On
                            </dt>
                            <dd className="mt-1 text-lg text-gray-900 dark:text-white">
                                {new Date(customer.createdAt).toLocaleDateString()}
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>

            {/* Edit Customer Modal */}
            <CustomerModal
                customer={customer}
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    // Remove /edit from the URL when closing the modal
                    if (editMode) {
                        navigate(`/customers/${customer.id}`, { replace: true });
                    }
                }}
                onSave={handleEditCustomer}
            />

            {/* Delete Confirmation Modal */}
            {isDeleteConfirmOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="delete-modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div
                            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                            aria-hidden="true"
                            onClick={() => !isDeleting && setIsDeleteConfirmOpen(false)}
                        ></div>

                        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 sm:mx-0 sm:h-10 sm:w-10">
                                        <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="delete-modal-title">
                                            Delete Customer
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Are you sure you want to delete <span className="font-semibold">{customer.name}</span>? This action cannot be undone.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    onClick={handleDeleteCustomer}
                                    disabled={isDeleting}
                                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm ${isDeleting ? 'opacity-75 cursor-not-allowed' : ''
                                        }`}
                                >
                                    {isDeleting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Deleting...
                                        </>
                                    ) : (
                                        'Delete'
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsDeleteConfirmOpen(false)}
                                    disabled={isDeleting}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Add global type declarations for the URL prefixes
declare global {
    interface Window {
        PULSEWAY_URL_PREFIX?: string;
        ZOHO_URL_PREFIX?: string;
        ITGLUE_URL_PREFIX?: string;
    }
}
