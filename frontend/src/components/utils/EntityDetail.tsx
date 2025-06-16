import { ReactNode } from 'react';

interface EntityDetailField {
    label: string;
    value: ReactNode;
}

interface EntityDetailProps {
    title: ReactNode;
    fields: EntityDetailField[];
    onBack?: () => void;
}

export function EntityDetail({ title, fields, onBack }: EntityDetailProps) {
    return (

    );
}
