import { create } from 'zustand';
import { User, Role, createUser } from '../types/admin';
import { v4 as uuidv4 } from 'uuid';

// Mock data
const mockUsers: User[] = [
  {
    id: uuidv4(),
    email: 'admin@cwi.at',
    name: 'Admin User',
    role: 'administrator',
    isEntraId: false,
    createdAt: '2024-03-15T10:00:00Z',
    lastLogin: '2024-03-20T08:30:00Z',
  },
  {
    id: uuidv4(),
    email: 'engineer@cwi.at',
    name: 'System Engineer',
    role: 'systemengineer',
    isEntraId: true,
    createdAt: '2024-03-16T09:00:00Z',
    lastLogin: '2024-03-19T14:20:00Z',
  },
];

const mockRoles: Role[] = [
  {
    id: uuidv4(),
    name: 'administrator',
    description: 'Full system access with all permissions',
    permissions: ['users.manage', 'roles.manage', 'customers.manage', 'images.manage', 'devices.manage'],
  },
  {
    id: uuidv4(),
    name: 'systemengineer',
    description: 'System engineer with device and image management permissions',
    permissions: ['customers.view', 'images.manage', 'devices.manage'],
  },
  {
    id: uuidv4(),
    name: 'readonly',
    description: 'Read-only access to system resources',
    permissions: ['customers.view', 'images.view', 'devices.view'],
  },
];

interface AdminState {
  users: User[];
  roles: Role[];
  isLoading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  fetchRoles: () => Promise<void>;
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => Promise<void>;
  updateUser: (id: string, user: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  updateRole: (id: string, role: Partial<Role>) => Promise<void>;
}

export const useAdminStore = create<AdminState>((set) => ({
  users: [],
  roles: [],
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ users: [...mockUsers], isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchRoles: async () => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ roles: [...mockRoles], isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addUser: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const newUser = createUser(userData);
      mockUsers.push(newUser);
      set(state => ({
        users: [...state.users, newUser],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateUser: async (id, userData) => {
    set({ isLoading: true, error: null });
    try {
      const index = mockUsers.findIndex(user => user.id === id);
      if (index === -1) throw new Error('User not found');

      mockUsers[index] = { ...mockUsers[index], ...userData };
      set(state => ({
        users: state.users.map(user => user.id === id ? mockUsers[index] : user),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  deleteUser: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const index = mockUsers.findIndex(user => user.id === id);
      if (index === -1) throw new Error('User not found');

      mockUsers.splice(index, 1);
      set(state => ({
        users: state.users.filter(user => user.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateRole: async (id, roleData) => {
    set({ isLoading: true, error: null });
    try {
      const index = mockRoles.findIndex(role => role.id === id);
      if (index === -1) throw new Error('Role not found');

      mockRoles[index] = { ...mockRoles[index], ...roleData };
      set(state => ({
        roles: state.roles.map(role => role.id === id ? mockRoles[index] : role),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));