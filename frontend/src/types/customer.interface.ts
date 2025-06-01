// src/types/customer.interface.ts
export interface CustomerSettings {
    defaultClientImage?: string;
}

export interface Customer {
    id: string;
    name: string;
    shortCode: string;
    createdAt: string;
    rmmId: number,
    zohoId: number;
    itGlueId: number;
}
