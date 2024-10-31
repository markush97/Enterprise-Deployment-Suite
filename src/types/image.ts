import { v4 as uuidv4 } from 'uuid';

export type Distribution = 'Windows 10' | 'Windows 11' | 'Windows Server 2019' | 'Windows Server 2022' | 'Ubuntu 22.04' | 'Ubuntu 20.04' | 'Debian 11' | 'Debian 12';

export interface SystemImage {
  id: string;
  name: string;
  version: string;
  distribution: Distribution;
  buildNumber: string;
  imagePath: string;
  uploadProgress?: number;
  size?: number;
  createdAt: string;
  updatedAt: string;
}

export const createSystemImage = (data: Omit<SystemImage, 'id' | 'createdAt' | 'updatedAt'>): SystemImage => ({
  id: uuidv4(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...data,
});