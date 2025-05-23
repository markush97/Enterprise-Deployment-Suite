import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from './components/LoginForm';
import { Dashboard } from './components/Dashboard';
import { useAuthStore } from './stores/authStore';
import { useThemeStore } from './stores/themeStore';
import { MsalProvider } from '@azure/msal-react';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

import type { IPublicClientApplication } from '@azure/msal-browser';

function App({ msalInstance }: { msalInstance: IPublicClientApplication }) {
  const { isDarkMode } = useThemeStore();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <MsalProvider instance={msalInstance}>
      <Router>
        <div className={isDarkMode ? 'dark' : ''}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard/*"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/login"
              element={<div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-900">
                <LoginForm />
              </div>}
            />
          </Routes>
        </div>
      </Router>
    </MsalProvider>
  );
}

export default App;
