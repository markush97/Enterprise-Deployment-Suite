import { useEffect, useState } from 'react';

import { api } from '../../api/api.service';
import { useAuthStore } from '../../states/auth.store';

interface RefreshToken {
  id: string;
  createdAt: string;
  lastUsedAt: string;
  device: string;
  isCurrent?: boolean;
}

export function AccountPage() {
  const user = useAuthStore(state => state.user);
  const [tokens, setTokens] = useState<RefreshToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [removingAll, setRemovingAll] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get<RefreshToken[]>('/auth/refresh')
      .then(res => setTokens(res.data))
      .catch(() => setError('Failed to load refresh tokens.'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await api.delete(`/auth/refresh/${id}`);
      setTokens(tokens => tokens.filter(t => t.id !== id));
    } catch {
      setError('Failed to delete refresh token.');
    } finally {
      setDeleting(null);
    }
  };

  const handleRemoveAll = async () => {
    setRemovingAll(true);
    try {
      // Remove all except the current
      const toDelete = tokens.filter(t => !t.isCurrent).map(t => t.id);
      await Promise.all(toDelete.map(id => api.delete(`/auth/refresh/${id}`)));
      setTokens(tokens => tokens.filter(t => t.isCurrent));
    } catch {
      setError('Failed to delete all refresh tokens.');
    } finally {
      setRemovingAll(false);
    }
  };

  // Sort tokens: current first, then others
  const sortedTokens = [...tokens].sort((a, b) => (b.isCurrent ? 1 : 0) - (a.isCurrent ? 1 : 0));
  const canRemoveAll = sortedTokens.some(t => !t.isCurrent);

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white dark:bg-gray-800 p-8 rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Account Information</h2>
      <div className="mb-6">
        <div className="mb-2">
          <span className="font-semibold">Name:</span> {user?.name}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Email:</span> {user?.email}
        </div>
        <div className="mb-2">
          <span className="font-semibold">ID:</span> {user?.id}
        </div>
      </div>
      <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200 flex items-center justify-between">
        Refresh Tokens
        <button
          onClick={handleRemoveAll}
          disabled={!canRemoveAll || removingAll}
          className="ml-4 px-3 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
        >
          {removingAll ? 'Removing...' : 'Remove All'}
        </button>
      </h3>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {sortedTokens.map(token => (
            <li key={token.id} className="py-2 flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-900 dark:text-white">
                  Device: {token.device || 'Unknown'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Created: {token.createdAt}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Last Used: {token.lastUsedAt || 'Never'}
                </div>
                {token.isCurrent && (
                  <span className="text-xs text-green-600 ml-2">Current session</span>
                )}
              </div>
              {!token.isCurrent && (
                <button
                  onClick={() => handleDelete(token.id)}
                  disabled={deleting === token.id}
                  className="ml-4 px-3 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting === token.id ? 'Deleting...' : 'Delete'}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
