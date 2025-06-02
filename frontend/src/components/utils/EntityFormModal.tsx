import React, { useState, useEffect } from 'react';

export interface FieldConfig {
    name: string;
    label: string;
    type: 'text' | 'number' | 'password' | 'email' | 'checkbox';
    placeholder?: string;
    required?: boolean;
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    transform?: (value: string) => any;
    validate?: (value: any) => string | null;
}

interface EntityFormModalProps<T> {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: T) => Promise<void>;
    title: string;
    fields: FieldConfig[];
    initialValues: T;
    validate?: (data: T) => Record<string, string>;
    loading?: boolean;
}

export function EntityFormModal<T extends Record<string, any>>({
    isOpen, onClose, onSave, title, fields, initialValues, validate, loading
}: EntityFormModalProps<T>) {
    const [form, setForm] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setForm(initialValues);
            setErrors({});
            setSubmitting(false);
        }
    }, [isOpen, initialValues]);

    const handleChange = (name: string, value: any) => {
        setForm(f => ({ ...f, [name]: value }));
    };

    const handleBlur = (field: FieldConfig) => {
        if (field.validate) {
            const error = field.validate(form[field.name]);
            setErrors(e => ({ ...e, [field.name]: error || '' }));
        } else if (field.required && !form[field.name]) {
            setErrors(e => ({ ...e, [field.name]: 'Required' }));
        } else {
            setErrors(e => ({ ...e, [field.name]: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let newErrors: Record<string, string> = {};
        fields.forEach(field => {
            const value = form[field.name];
            if (field.required && !value) {
                newErrors[field.name] = 'Required';
            } else if (field.pattern && value && !field.pattern.test(value)) {
                newErrors[field.name] = 'Invalid format';
            } else if (field.validate) {
                const err = field.validate(value);
                if (err) newErrors[field.name] = err;
            }
        });
        if (validate) {
            newErrors = { ...newErrors, ...validate(form) };
        }
        setErrors(newErrors);
        if (Object.values(newErrors).some(Boolean)) return;
        setSubmitting(true);
        await onSave(form);
        setSubmitting(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg p-6 relative">
                <button
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                    onClick={onClose}
                    aria-label="Close"
                >
                    ×
                </button>
                <h2 className="text-xl font-semibold mb-4">{title}</h2>
                <form onSubmit={handleSubmit} className="grid gap-4">
                    {fields.map(field => (
                        <div key={field.name} className="flex flex-col">
                            <label htmlFor={field.name} className="mb-1 font-medium">
                                {field.label}
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            <input
                                id={field.name}
                                name={field.name}
                                type={field.type}
                                value={form[field.name] ?? ''}
                                placeholder={field.placeholder}
                                required={field.required}
                                minLength={field.minLength}
                                maxLength={field.maxLength}
                                onChange={e => handleChange(field.name, field.type === 'number' ? e.target.value.replace(/\D/g, '') : e.target.value)}
                                onBlur={() => handleBlur(field)}
                                className={`border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[field.name] ? 'border-red-500' : 'border-gray-300'} bg-white dark:bg-gray-700`}
                                autoComplete="off"
                                inputMode={field.type === 'number' ? 'numeric' : undefined}
                                pattern={field.type === 'number' ? '[0-9]*' : undefined}
                                style={field.type === 'number' ? { MozAppearance: 'textfield' } : undefined}
                            />
                            {errors[field.name] && (
                                <span className="text-xs text-red-500 mt-1">{errors[field.name]}</span>
                            )}
                        </div>
                    ))}
                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            type="button"
                            className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300"
                            onClick={onClose}
                            disabled={submitting || loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                            disabled={submitting || loading}
                        >
                            {submitting || loading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
