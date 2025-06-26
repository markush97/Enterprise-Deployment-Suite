import { useEffect, useState } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import powershell from 'react-syntax-highlighter/dist/esm/languages/hljs/powershell';
import { prism, vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { useThemeStore } from '../../states/themeStore';

SyntaxHighlighter.registerLanguage('powershell', powershell);

export function ScriptHelpText() {
  const isDarkMode = useThemeStore(state => state.isDarkMode);
  const [open, setOpen] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // Handle mount/unmount for fade-out
  useEffect(() => {
    if (open) {
      setShouldRender(true);
    } else {
      const timeout = setTimeout(() => setShouldRender(false), 1200);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  const loggingExample = `Write-EDSLog -Level info -Message "Step started" -Meta @{ extraInfo = 1 }
# Automatically uses $eds for context`;
  const contextExample = `# Set context for first subtask
Set-EDSLogContext -JobId $JobId -TaskId1 -LocalLogPath $LocalLogPath -apiUrl $BackendUrl
# $eds is now available with .jobId, .taskId, .localLogPath, .apiUrl
& "$PSScriptRoot/subtask1.ps1"

# Set context for second subtask
Set-EDSLogContext -JobId $JobId -TaskId2 -LocalLogPath $LocalLogPath -apiUrl $BackendUrl
& "$PSScriptRoot/subtask2.ps1"

# Each subtask can just call Write-EDSLog with no context arguments`;
  const availableVars = [
    { name: '$eds.jobId', desc: 'The current job ID (string)' },
    { name: '$eds.taskId', desc: 'The current task ID (string)' },
    { name: '$eds.deviceName', desc: 'The name of the device (string)' },
    { name: '$eds.domainName', desc: 'The domain name' },
    { name: '$eds.entraTenant', desc: 'The entraID Tenant Id' },
    { name: '$eds.domainController', desc: 'The domain controller used by this device' },
    { name: '$eds.jobConfig', desc: 'The job configuration object' },
    { name: '$eds.domainjoin.username', desc: 'The username for domain join' },
    { name: '$eds.domainjoin.password', desc: 'The password for domain join' },
    {
      name: '$eds.domainjoin.ou',
      desc: 'The OU for domain join adapted to the current device type',
    },
    { name: '$eds.customerId', desc: 'The customer ID' },
    { name: '$eds.teamviewerId', desc: 'The Customer TeamViewer ID' },
    { name: '$eds.pulsewayDownloadUrl', desc: 'The Customer Pulseway download URL' },
    { name: '$eds.bitdefenderDownloadUrl', desc: 'The Customer Bitdefender download URL' },
  ];
  const availableFuncs = [
    {
      name: 'Write-EDSLog',
      desc: 'Logs a message to both the local log file in "C:\\Windows\\Setup\\EDS" and the backend. Uses $eds for context. Parameters: -Message, -Level, -Meta.',
    },
  ];
  const logLevels = [
    {
      level: 'info',
      desc: 'General information about script progress or state.',
      color: 'text-blue-700',
    },
    {
      level: 'warn',
      desc: 'Something unexpected happened, but the script can continue.',
      color: 'text-yellow-700',
    },
    {
      level: 'error',
      desc: 'A serious problem occurred; the script may not be able to continue.',
      color: 'text-red-700',
    },
    {
      level: 'success',
      desc: 'Indicates a successful step or completion.',
      color: 'text-green-700',
    },
    {
      level: 'debug',
      desc: 'Detailed technical information for debugging purposes.',
      color: 'text-gray-700',
    },
  ];

  return (
    <div className="mt-6 mb-8 text-base rounded-lg font-medium text-blue-700 dark:text-blue-200 bg-blue-50 dark:bg-blue-900/40 shadow-inner px-2 sm:px-4 py-2">
      <button
        className="w-full flex items-center gap-2 px-6 py-4 text-left focus:outline-none focus:ring-0 focus:ring-transparent transition-colors duration-200"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        tabIndex={0}
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          Script Help & Built-in Functions
          <span className="ml-2 text-gray-500 dark:text-gray-400 transform transition-transform duration-[1200ms]">
            {open ? '▲' : '▼'}
          </span>
        </h3>
        <span className="text-gray-500 dark:text-gray-400 text-sm italic mt-1 block">
          Show available functions and variables inside your script
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-[1200ms] ${open ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'} `}
        style={{ willChange: 'max-height, opacity' }}
      >
        {shouldRender && (
          <div className="px-6 pb-6 pt-2 space-y-4">
            <div>
              <div className="font-semibold mb-1 text-gray-800 dark:text-gray-200">
                Available Variables
              </div>
              <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 text-sm">
                {availableVars.map(v => (
                  <li key={v.name}>
                    <span className="font-mono text-blue-700 dark:text-blue-300">{v.name}</span>:{' '}
                    {v.desc}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-1 text-gray-800 dark:text-gray-200">
                Using uploaded files / content
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                Any files you upload for this task will be available on the target device in a
                subfolder named{' '}
                <span className="font-mono text-blue-700 dark:text-blue-300">content</span> inside
                the same directory as your{' '}
                <span className="font-mono text-blue-700 dark:text-blue-300">install.ps1</span>{' '}
                script. You can reference these files in your script using relative paths, for
                example:
                <br />
                <span className="font-mono text-xs block mt-1">.\content\yourfile.txt</span>
                <br />
                This allows you to use additional resources, configuration files, or binaries as
                part of your installation or verification process.
              </div>
              <div className="font-semibold mb-1 text-gray-800 dark:text-gray-200">
                Available Functions
              </div>
              <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 text-sm">
                {availableFuncs.map(f => (
                  <li key={f.name}>
                    <span className="font-mono text-green-700 dark:text-green-300">{f.name}</span>:{' '}
                    {f.desc}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-1 text-gray-800 dark:text-gray-200">Log Levels</div>
              <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 text-sm">
                {logLevels.map(level => (
                  <li key={level.level}>
                    <span
                      className={`font-mono ${level.color} dark:text-${level.color.split('-')[1]}`}
                    >
                      {level.level}
                    </span>
                    : {level.desc}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-1 text-gray-800 dark:text-gray-200">
                Logging Example
              </div>
              <SyntaxHighlighter
                style={isDarkMode ? vscDarkPlus : prism}
                showLineNumbers
                language="powershell"
                customStyle={{ borderRadius: 8, fontSize: 14, margin: 0 }}
                className="!bg-gray-100 dark:!bg-gray-900"
              >
                {loggingExample}
              </SyntaxHighlighter>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
