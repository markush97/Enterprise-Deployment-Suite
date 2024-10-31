import React from 'react';
import { WikiArticle } from '../../types/wiki';
import { FileText } from 'lucide-react';

interface WikiListProps {
  articles: WikiArticle[];
}

export function WikiList({ articles }: WikiListProps) {
  const groupedArticles = articles.reduce((acc, article) => {
    const category = article.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(article);
    return acc;
  }, {} as Record<string, WikiArticle[]>);

  return (
    <div className="space-y-8">
      {Object.entries(groupedArticles).map(([category, categoryArticles]) => (
        <div key={category} className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryArticles.map((article) => (
              <div
                key={article.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <FileText className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {article.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {article.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}