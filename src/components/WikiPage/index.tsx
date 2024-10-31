import React, { useState } from 'react';
import { TutorialPage } from './TutorialPage';
import { useWikiStore } from '../../stores/wikiStore';

export function WikiPage() {
  const { addArticle } = useWikiStore();
  const [isEditing, setIsEditing] = useState(true);

  const handleSave = (title: string, content: string) => {
    addArticle({
      title,
      content,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">Documentation</h1>
      <TutorialPage />
    </div>
  );
}