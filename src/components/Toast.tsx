import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`
        flex items-center p-4 rounded-lg shadow-lg
        ${type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}
      `}>
        <div className="flex-shrink-0">
          {type === 'success' ? (
            <CheckCircle className="h-5 w-5 text-green-400" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-400" />
          )}
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={onClose}
            className={`
              inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2
              ${type === 'success' 
                ? 'text-green-500 hover:text-green-600 focus:ring-green-500' 
                : 'text-red-500 hover:text-red-600 focus:ring-red-500'}
            `}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}