import React, { useState, useCallback } from 'react';
import { useWikiStore } from '../../stores/wikiStore';
import { WikiTag } from '../../types/wiki';
import * as Icons from 'lucide-react';
import { Plus, X, Edit2, ExternalLink } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';

interface TagFormData {
  title: string;
  icon: string;
  color: string;
}

export function TagManager() {
  const { tags, addTag, updateTag, deleteTag } = useWikiStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [formData, setFormData] = useState<TagFormData>({
    title: '',
    icon: 'Tag',
    color: '#3B82F6',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateTag(editingId, formData);
      setEditingId(null);
    } else {
      addTag(formData);
      setIsAdding(false);
    }
    setFormData({ title: '', icon: 'Tag', color: '#3B82F6' });
  };

  const handleEdit = (tag: WikiTag) => {
    setEditingId(tag.id);
    setFormData({
      title: tag.title,
      icon: tag.icon,
      color: tag.color,
    });
  };

  const handleInputChange = useCallback((field: keyof TagFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const TagForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Title
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          required
        />
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Icon Name
        </label>
        <input
          type="text"
          value={formData.icon}
          onChange={(e) => handleInputChange('icon', e.target.value)}
          className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          required
          placeholder="e.g., FileText, Book, Tag"
        />
        <a
          href="https://lucide.dev/icons"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          <ExternalLink className="h-4 w-4 mr-1" />
          Browse available icons
        </a>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Color
        </label>
        <div className="relative">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="w-10 h-10 rounded-md border border-gray-300 dark:border-gray-600 shadow-sm"
              style={{ backgroundColor: formData.color }}
            />
            <input
              type="text"
              value={formData.color}
              onChange={(e) => handleInputChange('color', e.target.value)}
              className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              pattern="^#[0-9A-Fa-f]{6}$"
              required
            />
          </div>
          {showColorPicker && (
            <div className="absolute z-50 mt-2">
              <div 
                className="fixed inset-0" 
                onClick={() => setShowColorPicker(false)}
              />
              <div className="relative">
                <HexColorPicker
                  color={formData.color}
                  onChange={(color) => handleInputChange('color', color)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-6">
        <button
          type="button"
          onClick={() => {
            setIsAdding(false);
            setEditingId(null);
            setFormData({ title: '', icon: 'Tag', color: '#3B82F6' });
          }}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {editingId ? 'Update' : 'Add'} Tag
        </button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Tags</h3>
        {!isAdding && !editingId && (
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Tag
          </button>
        )}
      </div>

      {(isAdding || editingId) && <TagForm />}

      <div className="space-y-2 bg-white dark:bg-gray-800 rounded-lg shadow divide-y divide-gray-200 dark:divide-gray-700">
        {tags.map((tag) => (
          <div
            key={tag.id}
            className="flex items-center justify-between p-4"
          >
            <div className="flex items-center space-x-3">
              {React.createElement(Icons[tag.icon as keyof typeof Icons] || Icons.Tag, {
                className: 'h-5 w-5',
                style: { color: tag.color },
              })}
              <span className="text-sm font-medium text-gray-900 dark:text-white">{tag.title}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleEdit(tag)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => deleteTag(tag.id)}
                className="p-1 rounded-md text-red-400 hover:text-red-500 dark:hover:text-red-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}