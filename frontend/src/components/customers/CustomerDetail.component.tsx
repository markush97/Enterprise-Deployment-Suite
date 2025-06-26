import { useState, useEffect } from 'react';
import { CustomerModal } from './CustomerModal.component';
import { ArrowLeft, Building2, Trash2, Edit } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { customerService } from '../../services/customer.service';
import { Customer, DomainJoinCredentials } from '../../types/customer.interface';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { useNavigate } from 'react-router-dom';
import { ConfirmDeleteModal } from '../utils/ConfirmDeleteModal';
import { CustomerDeviceCountersCard } from './CustomerDeviceCountersCard.component';
import { DomainJoinCredentialsCard } from './DomainJoinCredentialsCard.component';

interface CustomerPageProps {
    customer: Customer;
    onBack: () => void;
    onCustomerUpdated?: (customer: Customer) => void;
    onCustomerDeleted?: () => void;
}

export function CustomerDetail({ customer, onBack, onCustomerUpdated, onCustomerDeleted, editMode }: CustomerPageProps & { editMode?: boolean }) {
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

    // Domain Join Credentials state
    const [credentials, setCredentials] = useState<DomainJoinCredentials>({
        username: customer.deviceEnrollmentCredentials?.username || '',
        password: customer.deviceEnrollmentCredentials?.password || '',
    });
    const [domain, setDomain] = useState(customer.adDomain || '');
    const [savingCredentials, setSavingCredentials] = useState(false);

    const handleSaveCredentials = async () => {
        setSavingCredentials(true);
        try {
            const updatedCustomer = await customerService.updateCustomer(customer.id, {
                deviceEnrollmentCredentials: credentials,
            });
            toast.success('Domain join credentials updated');
            if (onCustomerUpdated) onCustomerUpdated(updatedCustomer);
        } catch (error: any) {
            toast.error(error.message || 'Failed to update credentials');
        } finally {
            setSavingCredentials(false);
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
                        <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Pulseway Download URL
                            </dt>
                            <dd className="mt-1 text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                {customer.pulsewayDownloadUrl ? (
                                    <span className="text-green-600 dark:text-green-400" title="Set">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    </span>
                                ) : (
                                    <span className="text-red-500 dark:text-red-400" title="Not set">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </span>
                                )}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Bitdefender Download URL
                            </dt>
                            <dd className="mt-1 text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                {customer.bitdefenderDownloadUrl ? (
                                    <span className="text-green-600 dark:text-green-400" title="Set">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    </span>
                                ) : (
                                    <span className="text-red-500 dark:text-red-400" title="Not set">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </span>
                                )}
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>

            <CustomerDeviceCountersCard customer={customer} onCustomerUpdated={onCustomerUpdated} />

            <DomainJoinCredentialsCard
                credentials={credentials}
                setCredentials={setCredentials}
                domain={domain}
                setDomain={setDomain}
                savingCredentials={savingCredentials}
                onSave={handleSaveCredentials}
            />

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
            <ConfirmDeleteModal
                isOpen={isDeleteConfirmOpen}
                title="Delete Customer"
                entityName={customer.name}
                onCancel={() => setIsDeleteConfirmOpen(false)}
                onConfirm={handleDeleteCustomer}
                isLoading={isDeleting}
            />
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
