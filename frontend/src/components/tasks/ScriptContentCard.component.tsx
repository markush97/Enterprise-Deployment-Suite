import { useState } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useThemeStore } from '../../states/themeStore';
import powershell from 'react-syntax-highlighter/dist/esm/languages/hljs//powershell';

interface ScriptContentCardProps {
  script: string;
  onSave: (newScript: string) => Promise<void>;
  isSaving?: boolean;
}

SyntaxHighlighter.registerLanguage('powershell', powershell);

export function ScriptContentCard({ script, onSave, isSaving }: ScriptContentCardProps) {
  const [editScript, setEditScript] = useState(script || '');
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isDarkMode = useThemeStore((state => state.isDarkMode));

  const handleSave = async () => {
    setError(null);
    try {
      await onSave(editScript);
      setEditing(false);
    } catch (e: any) {
      setError(e.message || 'Failed to save script');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg mt-6">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Install Script</h2>
        <button
          className="ml-auto px-3 py-1 text-sm rounded bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-400 transition"
          onClick={() => setEditing((v) => !v)}
          disabled={isSaving}
        >
          {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>
      <div className="px-6 py-4">
        {editing ? (
          <>
            <textarea
              className="w-full min-h-[180px] font-mono text-sm p-2 border rounded bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              value={editScript}
              onChange={e => setEditScript(e.target.value)}
              disabled={isSaving}
            />
            <div className="flex items-center mt-2 gap-2">
              <button
                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-400 transition disabled:opacity-50"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              {error && <span className="text-red-500 text-sm ml-2">{error}</span>}
            </div>
          </>
        ) : (
          <SyntaxHighlighter
            style={isDarkMode ? vscDarkPlus : prism}
            showLineNumbers
            language="powershell"
            customStyle={{ borderRadius: 8, fontSize: 14, margin: 0 }}
            className="!bg-gray-100 dark:!bg-gray-900"
          >
            {editScript || '# No script provided'}
          </SyntaxHighlighter>
        )}
      </div>
    </div>
  );
}
