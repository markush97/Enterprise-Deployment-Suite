import { ReactNode, useEffect, useRef, useState } from 'react';

import { ContextMenu } from './ContextMenu';

export interface EntityListColumn<T> {
  label: string;
  accessor?: keyof T;
  render?: (item: T) => ReactNode;
  className?: string;
}

export interface EntityListAction<T> {
  label: string;
  onClick: (item: T) => void;
  tooltip?: string | ((item: T) => string | undefined);
  disabled?: boolean | ((item: T) => boolean);
  danger?: boolean;
}

interface EntityListProps<T> {
  data: T[];
  columns: EntityListColumn<T>[];
  actions?: EntityListAction<T>[];
  onRowClick?: (item: T) => void;
  onAdd?: () => void;
  addLabel?: string;
  title?: ReactNode;
  emptyState?: ReactNode;
  isLoading?: boolean;
  isError?: boolean;
  error?: ReactNode;
  onRetry?: () => void;
}

export function EntityList<T extends { id: string }>({
  data,
  columns,
  actions = [],
  onRowClick,
  onAdd,
  addLabel = 'Add',
  title,
  emptyState,
  isLoading,
  isError,
  error,
  onRetry,
}: EntityListProps<T>) {
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenId(null);
      }
    }
    if (menuOpenId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpenId]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden transition-all duration-300">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">{title}</div>
            {onAdd && (
              <button
                onClick={onAdd}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
              >
                {addLabel}
              </button>
            )}
          </div>
        </div>
        {isError && (
          <div className="p-4 bg-red-50 dark:bg-red-900/30 border-b border-red-200 dark:border-red-800">
            <div className="flex items-center">
              <span className="h-5 w-5 text-red-500 mr-2">!</span>
              <p className="text-sm text-red-600 dark:text-red-400">{error || 'Failed to load'}</p>
            </div>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline focus:outline-none"
              >
                Try again
              </button>
            )}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {columns.map((col, i) => (
                  <th
                    key={i}
                    className={
                      col.className ||
                      'px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'
                    }
                  >
                    {col.label}
                  </th>
                ))}
                {actions.length > 0 && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {isLoading ? null : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                    className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    {emptyState}
                  </td>
                </tr>
              ) : (
                data.map(item => (
                  <tr
                    key={item.id}
                    className="group hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition duration-150 ease-in-out"
                    onClick={() => onRowClick?.(item)}
                  >
                    {columns.map((col, i) => (
                      <td key={i} className={col.className || 'px-6 py-4 whitespace-nowrap'}>
                        {col.render
                          ? col.render(item)
                          : col.accessor
                            ? (item as any)[col.accessor]
                            : null}
                      </td>
                    ))}
                    {actions.length > 0 && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2 relative">
                          <button
                            onClick={event => {
                              event.stopPropagation();
                              const rect = (event.target as HTMLElement).getBoundingClientRect();
                              if (menuOpenId === item.id) {
                                setMenuOpenId(null);
                                setMenuPosition(null);
                              } else {
                                setMenuOpenId(item.id);
                                setMenuPosition({
                                  top: rect.bottom + window.scrollY,
                                  left: rect.right - 160,
                                });
                              }
                            }}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none group-hover:bg-transparent"
                            title="Actions"
                          >
                            <span className="sr-only">Actions</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-5 h-5 text-gray-600 dark:text-gray-300"
                            >
                              <circle cx="12" cy="12" r="1.5" />
                              <circle cx="19" cy="12" r="1.5" />
                              <circle cx="5" cy="12" r="1.5" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <ContextMenu
            isOpen={!!menuOpenId}
            anchorPosition={menuPosition}
            entries={
              menuOpenId
                ? actions.map(a => ({
                    label: a.label,
                    danger: a.danger,
                    disabled:
                      typeof a.disabled === 'function'
                        ? a.disabled(data.find(d => d.id === menuOpenId)!)
                        : a.disabled,
                    tooltip:
                      typeof a.tooltip === 'function'
                        ? a.tooltip(data.find(d => d.id === menuOpenId)!)
                        : a.tooltip,
                    onClick: () => {
                      const item = data.find(d => d.id === menuOpenId);
                      if (item) a.onClick(item);
                      setMenuOpenId(null);
                      setMenuPosition(null);
                    },
                  }))
                : []
            }
            onClose={() => {
              setMenuOpenId(null);
              setMenuPosition(null);
            }}
            menuRef={menuRef}
            title="Actions"
          />
        </div>
      </div>
    </div>
  );
}
