import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Customer } from '../../types/customer.interface';

interface CustomerModalProps {
    customer?: Customer;
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<Customer, 'id' | 'createdAt'>) => Promise<void>;
}

export function CustomerModal({ customer, isOpen, onClose, onSave }: CustomerModalProps) {
    const [formData, setFormData] = useState<Omit<Customer, 'id' | 'createdAt'>>({
        name: '',
        shortCode: '',
        zohoId: 0,
        itGlueId: 0,
        rmmId: 0,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (customer) {
            setFormData({
                name: customer.name,
                shortCode: customer.shortCode,
                rmmId: customer.rmmId,
                zohoId: customer.zohoId,
                itGlueId: customer.itGlueId
            });
        } else {
            setFormData({
                name: '',
                shortCode: '',
                rmmId: 0,
                zohoId: 0,
                itGlueId: 0
            });
        }
        setErrors({});
    }, [customer, isOpen]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.shortCode.trim()) {
            newErrors.shortCode = 'Short code is required';
        } else if (!/^[A-Z0-9]{3,8}$/.test(formData.shortCode)) {
            newErrors.shortCode = 'Short code must be 3-8 uppercase letters/numbers';
        }

        if (!formData.rmmId) {
            newErrors.rmmId = 'Pulseway ID is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === 'shortCode') {
            setFormData({ ...formData, [name]: value.toUpperCase() });
        } else {
            setFormData({ ...formData, [name]: value });
        }

        // Clear error when user types
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            setIsSubmitting(true);
            await onSave(formData);
            onClose();
        } catch (error: any) {
            if (error.message === 'Short code must be unique') {
                setErrors({ ...errors, shortCode: 'This short code is already in use' });
            } else {
                setErrors({ ...errors, form: error.message || 'Failed to save customer' });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                    aria-hidden="true"
                    onClick={onClose}
                ></div>

                {/* Modal panel */}
                <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="absolute top-0 right-0 pt-4 pr-4">
                        <button
                            type="button"
                            className="bg-white dark:bg-gray-800 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            onClick={onClose}
                        >
                            <span className="sr-only">Close</span>
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                            {customer ? 'Edit Customer' : 'Add New Customer'}
                        </h3>

                        <form onSubmit={handleSubmit} className="mt-4 space-y-6">
                            {errors.form && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md">
                                    <p className="text-sm text-red-600 dark:text-red-400">{errors.form}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Customer Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white ${errors.name
                                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                            : 'border-gray-300 dark:border-gray-600'
                                            }`}
                                        placeholder="e.g. Acme Corporation"
                                    />
                                    {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="shortCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Short Code
                                        </label>
                                        <input
                                            type="text"
                                            name="shortCode"
                                            id="shortCode"
                                            value={formData.shortCode}
                                            onChange={handleChange}
                                            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white ${errors.shortCode
                                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                : 'border-gray-300 dark:border-gray-600'
                                                }`}
                                            placeholder="3-8 uppercase letters/numbers"
                                        />
                                        {errors.shortCode && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.shortCode}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="pulsewayId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Pulseway ID
                                        </label>
                                        <input
                                            type="text"
                                            name="pulsewayId"
                                            id="pulsewayId"
                                            value={formData.rmmId === 0 ? '' : formData.rmmId}
                                            onChange={e => handleChange({
                                                ...e,
                                                target: { ...e.target, name: 'rmmId', value: e.target.value.replace(/\D/g, '') }
                                            })}
                                            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white ${errors.pulsewayId
                                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                : 'border-gray-300 dark:border-gray-600'
                                                }`}
                                            placeholder="e.g. 1234"
                                        />
                                        {errors.pulsewayId && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.pulsewayId}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="zohoId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Zoho ID
                                        </label>
                                        <input
                                            type="text"
                                            name="zohoId"
                                            id="zohoId"
                                            value={formData.zohoId === 0 ? '' : formData.zohoId}
                                            onChange={e => handleChange({
                                                ...e,
                                                target: { ...e.target, name: 'zohoId', value: e.target.value.replace(/\D/g, '') }
                                            })}
                                            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white ${errors.zohoId
                                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                : 'border-gray-300 dark:border-gray-600'
                                                }`}
                                            placeholder="e.g. 155899000000360493"
                                        />
                                        {errors.zohoId && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.zohoId}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="itGlueId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            IT-Glue ID
                                        </label>
                                        <input
                                            type="text"
                                            name="itGlueId"
                                            id="itGlueId"
                                            value={formData.itGlueId === 0 ? '' : formData.itGlueId}
                                            onChange={e => handleChange({
                                                ...e,
                                                target: { ...e.target, name: 'itGlueId', value: e.target.value.replace(/\D/g, '') }
                                            })}
                                            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white ${errors.itGlueId
                                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                : 'border-gray-300 dark:border-gray-600'
                                                }`}
                                            placeholder="e.g. 3980381753180365"
                                        />
                                        {errors.itGlueId && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.itGlueId}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Saving...
                                        </>
                                    ) : (
                                        'Save'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
