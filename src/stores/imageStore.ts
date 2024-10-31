import { create } from 'zustand';
import { SystemImage, Distribution, createSystemImage } from '../types/image';
import { v4 as uuidv4 } from 'uuid';

// Mock data
const mockImages: SystemImage[] = [
  {
    id: uuidv4(),
    name: 'Windows 11 Enterprise',
    version: '22H2',
    distribution: 'Windows 11',
    buildNumber: '22621.1702',
    imagePath: '/images/win11-22h2.wim',
    size: 4.7 * 1024 * 1024 * 1024, // 4.7GB
    createdAt: '2024-03-15T10:00:00Z',
    updatedAt: '2024-03-15T10:00:00Z',
  },
  {
    id: uuidv4(),
    name: 'Ubuntu Server LTS',
    version: '22.04',
    distribution: 'Ubuntu 22.04',
    buildNumber: '22.04.3',
    imagePath: '/images/ubuntu-22.04.3.iso',
    size: 1.2 * 1024 * 1024 * 1024, // 1.2GB
    createdAt: '2024-03-14T15:30:00Z',
    updatedAt: '2024-03-14T15:30:00Z',
  },
];

interface ImageState {
  images: SystemImage[];
  isLoading: boolean;
  error: string | null;
  uploadProgress: Record<string, number>;
  fetchImages: () => Promise<void>;
  addImage: (image: Omit<SystemImage, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateImage: (id: string, image: Partial<SystemImage>) => Promise<void>;
  deleteImage: (id: string) => Promise<void>;
  uploadImage: (file: File, imageData: Omit<SystemImage, 'id' | 'createdAt' | 'updatedAt' | 'imagePath'>) => Promise<void>;
}

export const useImageStore = create<ImageState>((set, get) => ({
  images: [],
  isLoading: false,
  error: null,
  uploadProgress: {},

  fetchImages: async () => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ images: [...mockImages], isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addImage: async (image) => {
    set({ isLoading: true, error: null });
    try {
      const newImage = createSystemImage(image);
      mockImages.push(newImage);
      set(state => ({
        images: [...state.images, newImage],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateImage: async (id, image) => {
    set({ isLoading: true, error: null });
    try {
      const index = mockImages.findIndex(img => img.id === id);
      if (index === -1) throw new Error('Image not found');

      const updatedImage = {
        ...mockImages[index],
        ...image,
        updatedAt: new Date().toISOString(),
      };
      mockImages[index] = updatedImage;

      set(state => ({
        images: state.images.map(img => img.id === id ? updatedImage : img),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  deleteImage: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const index = mockImages.findIndex(img => img.id === id);
      if (index === -1) throw new Error('Image not found');
      
      mockImages.splice(index, 1);
      set(state => ({
        images: state.images.filter(img => img.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  uploadImage: async (file: File, imageData) => {
    const uploadId = uuidv4();
    set(state => ({
      uploadProgress: { ...state.uploadProgress, [uploadId]: 0 },
    }));

    try {
      // Simulate file upload with progress
      const totalChunks = 100;
      for (let i = 0; i <= totalChunks; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        const progress = Math.round((i / totalChunks) * 100);
        set(state => ({
          uploadProgress: { ...state.uploadProgress, [uploadId]: progress },
        }));
      }

      // Create new image record
      const newImage = createSystemImage({
        ...imageData,
        imagePath: `/images/${file.name}`,
        size: file.size,
      });

      mockImages.push(newImage);
      set(state => ({
        images: [...state.images, newImage],
        uploadProgress: { ...state.uploadProgress, [uploadId]: 100 },
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },
}));