import React from 'react';
import { WikiPage, WikiCategory } from '../../types/wiki';
import { ChevronRight, Book } from 'lucide-react';

interface WikiSidebarProps {
  categories: WikiCategory[];
  pages: WikiPage[];
  selectedPage: WikiPage | null;
  onSelectPage: (page: WikiPage) => void;
}

export function WikiSidebar({ categories, pages, selectedPage, onSelectPage }: WikiSidebarProps) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
      <div className="p-4">
        <nav className="space-y-8">
          {categories.sort((a, b) => a.order - b.order).map((category) => {
            const categoryPages = pages.filter(page => page.category === category.slug);
            
            return (
              <div key={category.id}>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {category.name}
                </h3>
                <div className="mt-2 space-y-1">
                  {categoryPages.map((page) => (
                    <button
                      key={page.id}
                      onClick={() => onSelectPage(page)}
                      className={`flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors ${
                        selectedPage?.id === page.id
                          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/50'
                          : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Book className="h-4 w-4 mr-2" />
                      <span className="truncate">{page.title}</span>
                      <ChevronRight className={`ml-auto h-4 w-4 ${
                        selectedPage?.id === page.id ? 'opacity-100' : 'opacity-0'
                      }`} />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
}