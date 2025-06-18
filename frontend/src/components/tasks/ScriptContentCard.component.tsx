import { useState } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useThemeStore } from '../../states/themeStore';
import powershell from 'react-syntax-highlighter/dist/esm/languages/hljs/powershell';
import { ScriptHelpText } from './ScriptHelpText.component';

interface ScriptContentCardProps {
  installScript: string;
  verifyScript: string;
  onSave: (newInstallScript: string, newVerifyScript: string) => Promise<void>;
  isSaving?: boolean;
  hint?: string;
}

SyntaxHighlighter.registerLanguage('powershell', powershell);

export function ScriptContentCard({ installScript, verifyScript, onSave, isSaving, hint }: ScriptContentCardProps) {
  const [editInstallScript, setEditInstallScript] = useState(installScript || '');
  const [editVerifyScript, setEditVerifyScript] = useState(verifyScript || '');
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isDarkMode = useThemeStore((state => state.isDarkMode));

  const handleSave = async () => {
    setError(null);
    try {
      await onSave(editInstallScript, editVerifyScript);
      setEditing(false);
    } catch (e: any) {
      setError(e.message || 'Failed to save script');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg mt-6">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Install & Verify Scripts</h2>
        <button
          className="ml-auto px-3 py-1 text-sm rounded bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-400 transition"
          onClick={() => setEditing((v) => !v)}
          disabled={isSaving}
        >
          {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>
      {hint && (
        <div className="px-6 pb-2 text-xs text-blue-700 dark:text-blue-300 italic">{hint}</div>
      )}
      <div className="px-4 sm:px-8 py-2">
        <ScriptHelpText />
      </div>
      <div className="px-6 py-4">
        {editing ? (
          <>
            <div className="mb-4">
              <div className="font-semibold mb-1 text-gray-800 dark:text-gray-200">Install Script</div>
              <div className="text-xs text-blue-700 dark:text-blue-300 italic mb-1">
                Script to perform the installation steps for this task. This script will be executed on the target device to install or configure the required software or settings. Make sure it is idempotent and safe to run multiple times if needed.
              </div>
              <textarea
                className="w-full min-h-[120px] font-mono text-sm p-2 border rounded bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                value={editInstallScript}
                onChange={e => setEditInstallScript(e.target.value)}
                disabled={isSaving}
              />
            </div>
            <div>
              <div className="font-semibold mb-1 text-gray-800 dark:text-gray-200">Verify Script</div>
              <div className="text-xs text-blue-700 dark:text-blue-300 italic mb-1">
                Script to verify if the installation was successfull. If this script exits with a sucessfull code the task is noted as successfull. Keep in mind, that if the installation is asynchron, verification scripts do not work (yet) since the verification is executed before the installation is done.
              </div>
              <textarea
                className="w-full min-h-[120px] font-mono text-sm p-2 border rounded bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                value={editVerifyScript}
                onChange={e => setEditVerifyScript(e.target.value)}
                disabled={isSaving}
              />
            </div>
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
          <>
            <div className="mb-4">
              <div className="font-semibold mb-1 text-gray-800 dark:text-gray-200">Install Script</div>
              <div className="text-xs text-blue-700 dark:text-blue-300 italic mb-1">
                Script to perform the installation steps for this task. This script will be executed on the target device to install or configure the required software or settings. Make sure it is idempotent and safe to run multiple times if needed.
              </div>
              <SyntaxHighlighter
                style={isDarkMode ? vscDarkPlus : prism}
                showLineNumbers
                language="powershell"
                customStyle={{ borderRadius: 8, fontSize: 14, margin: 0 }}
                className="!bg-gray-100 dark:!bg-gray-900"
              >
                {editInstallScript || '# No install script provided'}
              </SyntaxHighlighter>
            </div>
            <div>
              <div className="font-semibold mb-1 text-gray-800 dark:text-gray-200">Verify Script</div>
              <div className="text-xs text-blue-700 dark:text-blue-300 italic mb-1">
                Script to verify if the installation was successfull. If this script exits with a sucessfull code the task is noted as successfull. Keep in mind, that if the installation is asynchron, verification scripts do not work (yet) since the verification is executed before the installation is done.
              </div>
              <SyntaxHighlighter
                style={isDarkMode ? vscDarkPlus : prism}
                showLineNumbers
                language="powershell"
                customStyle={{ borderRadius: 8, fontSize: 14, margin: 0 }}
                className="!bg-gray-100 dark:!bg-gray-900"
              >
                {editVerifyScript || '# No verify script provided'}
              </SyntaxHighlighter>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
