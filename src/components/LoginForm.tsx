import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useMsal } from '@azure/msal-react';
import { AlertCircle, ExternalLink, LogIn } from 'lucide-react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setError] = useState('');
  const navigate = useNavigate();
  const { login, loginWithEntraId } = useAuthStore();
  const { instance } = useMsal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  const handleEntraLogin = async () => {
    try {
      const response = await instance.loginPopup({ scopes: ['api://c8f5d88b-c5d2-427e-9259-4daf0be50cc8/access_as_user'] })
      const account = response.account;
      await loginWithEntraId({ displayName: account.name, email: account.username, userId: account.nativeAccountId, accessToken: response.accessToken })
      navigate('/dashboard');
    } catch (err) {
      console.error(err)
      setError('Login failure');
    }
  };


  return (
    < div className="min-h-screen flex flex-col" >
      <div className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
          <div className="text-center">
            <img
              src="/logo.png"
              alt="CWI Logo"
              className="h-16 mx-auto mb-8"
            />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              System Imaging Portal
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Sign in to manage system images
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {err && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/50 p-3 rounded">
                <AlertCircle className="w-5 h-5" />
                <span>{err}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white dark:bg-gray-700"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white dark:bg-gray-700"
                />
              </div>
            </div>

            <div className="space-y-4">
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <LogIn className="w-5 h-5 mr-2" />
                Sign in
              </button>

              <button
                type="button"
                onClick={handleEntraLogin}
                className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Sign in with Entra ID
              </button>
            </div>
          </form>
        </div>
      </div>

      <footer className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          © {new Date().getFullYear()} Markus Hinkel |{' '}
          <a
            href="https://cwi.at"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            CWI
          </a>
        </p>
      </footer>
    </div >
  );
}
