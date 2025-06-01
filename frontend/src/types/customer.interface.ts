// src/types/customer.interface.ts
export interface CustomerSettings {
  defaultClientImage?: string;
}

export interface Customer {
  id: string;
  name: string;
  shortCode: string;
  pulsewayId: string;
  createdAt: string;
  settings?: CustomerSettings;
  zohoId?: string;
  itGlueId?: string;
}
