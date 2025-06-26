import React from 'react';

interface DomainJoinCredentials {
  username: string;
  password: string;
}

interface Props {
  credentials: DomainJoinCredentials;
  setCredentials: React.Dispatch<React.SetStateAction<DomainJoinCredentials>>;
  domain: string;
  setDomain: React.Dispatch<React.SetStateAction<string>>;
  savingCredentials: boolean;
  onSave: () => void;
}

export function DomainJoinCredentialsCard({
  credentials,
  setCredentials,
  domain,
  setDomain,
  savingCredentials,
  onSave,
}: Props) {
  // Store initial values for reset
  const initial = React.useRef({
    username: credentials.username,
    password: credentials.password,
    domain: domain,
  });

  const [accordionOpen, setAccordionOpen] = React.useState(false);
  const [shouldRenderAccordion, setShouldRenderAccordion] = React.useState(false);

  React.useEffect(() => {
    if (accordionOpen) {
      setShouldRenderAccordion(true);
    } else {
      const timeout = setTimeout(() => setShouldRenderAccordion(false), 500); // match duration-500
      return () => clearTimeout(timeout);
    }
  }, [accordionOpen]);

  const handleReset = () => {
    setCredentials({
      username: initial.current.username,
      password: initial.current.password,
    });
    setDomain(initial.current.domain);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg mt-6">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Domain Join Credentials
        </h3>
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          <p>
            <span className="font-semibold">Important:</span> Do{' '}
            <span className="text-red-600 font-bold">not</span> use a domain administrator account
            for device joins. Instead, create a dedicated join user and rotate its password
            regularly. See the instructions below for how to create a secure join user in Active
            Directory.
          </p>
        </div>
        <button
          className="w-full flex items-center gap-2 px-0 py-2 text-left focus:outline-none focus:ring-0 focus:ring-transparent transition-colors duration-200"
          onClick={() => setAccordionOpen(o => !o)}
          aria-expanded={accordionOpen}
          tabIndex={0}
        >
          <span className="text-base font-semibold text-blue-700 dark:text-blue-300">
            Show instructions for creating a join user in Active Directory
          </span>
          <span className="ml-2 text-gray-500 dark:text-gray-400 transform transition-transform duration-300">
            {accordionOpen ? '▲' : '▼'}
          </span>
        </button>
        <div
          className={`overflow-hidden transition-all duration-500 ${accordionOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}
          style={{ willChange: 'max-height, opacity' }}
        >
          {shouldRenderAccordion && (
            <div className="mt-2 px-2 pb-2 text-sm text-gray-700 dark:text-gray-200 space-y-2">
              <ol className="list-decimal pl-5 space-y-1">
                <li>
                  Open the <b>Active Directory Users and Computers</b> snap-in.
                </li>
                <li>
                  Right-click the container (OU) where you want computers to be added and select{' '}
                  <b>Delegate Control</b>.
                </li>
                <li>
                  Click <b>Add</b> to add the user or group that will join devices. Click{' '}
                  <b>Next</b>.
                </li>
                <li>
                  On <b>Tasks to Delegate</b>, select <b>Create a custom task to delegate</b>. Click{' '}
                  <b>Next</b>.
                </li>
                <li>
                  Choose <b>Only the following objects in the folder</b> and check{' '}
                  <b>Computer objects</b>. Also check <b>Create selected objects in this folder</b>.
                  Click <b>Next</b>.
                </li>
                <li>
                  On <b>Permissions</b>, select <b>General</b>, then check{' '}
                  <b>Create All Child Objects</b>. Click <b>Next</b> and then <b>Finish</b>.
                </li>
                <li>
                  Set a strong password for the join user and rotate it regularly. Do <b>not</b>{' '}
                  grant unnecessary permissions.
                </li>
              </ol>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                This join user will only have the rights needed to add computers to the specified
                OU. Never use a domain administrator account for this purpose.
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="px-6 py-4 space-y-4">
        <div className="flex flex-col md:flex-row md:space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={credentials.username}
              onChange={e => setCredentials(c => ({ ...c, username: e.target.value }))}
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Enter the username of the join user (e.g. <code>joinuser</code> without any
              domain-parts).
            </div>
          </div>
          <div className="flex-1 mt-4 md:mt-0">
            <label className="block text-sm font-medium mb-1">Domain</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={domain}
              onChange={e => setDomain(e.target.value)}
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Enter the full domain name (e.g. <code>yourdomain.local / ad.yourdomain.com</code>).{' '}
              <b>Do not</b> use the short NETBIOS name or the distinguished name (DN).
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            value={credentials.password}
            onChange={e => setCredentials(c => ({ ...c, password: e.target.value }))}
          />
        </div>
        <div className="col-span-full flex justify-end mt-4 space-x-2">
          <button
            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition disabled:opacity-50"
            type="button"
            onClick={handleReset}
            disabled={savingCredentials}
          >
            Reset
          </button>
          <button
            className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-400 transition disabled:opacity-50"
            onClick={onSave}
            disabled={savingCredentials}
          >
            {savingCredentials ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
