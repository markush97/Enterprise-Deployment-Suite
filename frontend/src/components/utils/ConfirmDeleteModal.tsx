import { AlertCircle } from 'lucide-react';
import React from 'react';

interface ConfirmDeleteModalProps {
    isOpen: boolean;
    title: string;
    entityName: string;
    onCancel: () => void;
    onConfirm: () => void;
}

export function ConfirmDeleteModal({ isOpen, title, entityName, onCancel, onConfirm }: ConfirmDeleteModalProps) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6 relative animate-fadeIn">
                <button
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    onClick={onCancel}
                >
                    <span className="text-2xl">&times;</span>
                </button>
                <div className="flex items-center mb-4">
                    <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400 mr-2" />
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
                </div>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Are you sure you want to delete <span className="font-semibold">{entityName}</span>? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
