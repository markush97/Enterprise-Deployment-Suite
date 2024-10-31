import { v4 as uuidv4 } from 'uuid';

export type UserRole = 'administrator' | 'readonly' | 'systemengineer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isEntraId: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface Role {
  id: string;
  name: UserRole;
  description: string;
  permissions: string[];
}

export const createUser = (data: Omit<User, 'id' | 'createdAt'>): User => ({
  id: uuidv4(),
  createdAt: new Date().toISOString(),
  ...data,
});