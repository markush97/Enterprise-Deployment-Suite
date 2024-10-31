import React, { useState, useEffect, useRef } from 'react';
import { SystemImage, Distribution } from '../types/image';
import { useImageStore } from '../stores/imageStore';
import { X, Upload, HardDrive } from 'lucide-react';

interface ImageModalProps {
  image?: SystemImage;
  isOpen: boolean;
  onClose: () => void;
}

const distributions: Distribution[] = [
  'Windows 10',
  'Windows 11',
  'Windows Server 2019',
  'Windows Server 2022',
  'Ubuntu 22.04',
  'Ubuntu 20.04',
  'Debian 11',
  'Debian 12',
];

export function ImageModal({ image, isOpen, onClose }: ImageModalProps) {
  const { addImage, updateImage, uploadImage } = useImageStore();
  const [formData, setFormData] = useState({
    name: '',
    version: '',
    distribution: 'Windows 11' as Distribution,
    buildNumber: '',
    imagePath: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (image) {
      setFormData({
        name: image.name,
        version: image.version,
        distribution: image.distribution,
        buildNumber: image.buildNumber,
        imagePath: image.imagePath,
      });
    } else {
      setFormData({
        name: '',
        version: '',
        distribution: 'Windows 11',
        buildNumber: '',
        imagePath: '',
      });
    }
    setFile(null);
    setUploadProgress(0);
    setIsUploading(false);
  }, [image, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (file) {
        setIsUploading(true);
        await uploadImage(file, formData);
      } else if (image) {
        await updateImage(image.id, formData);
      } else {
        await addImage(formData);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 15 * 1024 * 1024 * 1024) { // 15GB
        alert('File size exceeds 15GB limit');
        return;
      }
      setFile(selectedFile);
      setFormData(prev => ({
        ...prev,
        imagePath: selectedFile.name,
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {image ? 'Edit System Image' : 'Add New System Image'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Image Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Distribution
              </label>
              <select
                value={formData.distribution}
                onChange={(e) => setFormData({ ...formData, distribution: e.target.value as Distribution })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                {distributions.map((dist) => (
                  <option key={dist} value={dist}>{dist}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Version
              </label>
              <input
                type="text"
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Build Number
              </label>
              <input
                type="text"
                value={formData.buildNumber}
                onChange={(e) => setFormData({ ...formData, buildNumber: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Image File
              </label>
              {!image && (
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <HardDrive className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                      <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                        <span>Upload a file</span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="sr-only"
                          onChange={handleFileChange}
                          accept=".wim,.iso,.img"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      WIM, ISO, or IMG up to 15GB
                    </p>
                  </div>
                </div>
              )}
              {file && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>{file.name}</span>
                    <span>{(file.size / (1024 * 1024 * 1024)).toFixed(2)} GB</span>
                  </div>
                  {isUploading && (
                    <div className="mt-2">
                      <div className="relative pt-1">
                        <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-200">
                          <div
                            style={{ width: `${uploadProgress}%` }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-300"
                          ></div>
                        </div>
                        <div className="text-right text-xs mt-1 text-gray-500">
                          {uploadProgress}%
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isUploading ? 'Uploading...' : image ? 'Save Changes' : 'Add Image'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}