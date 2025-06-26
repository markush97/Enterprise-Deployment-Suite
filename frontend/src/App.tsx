import { useEffect } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';

import { LoginForm } from './components/auth/Login-page.component';
import { CustomersModule } from './components/customers/CustomerModule';
import { Dashboard } from './components/dashboard/Dashboard.component';
import { DevicesModule } from './components/devices/DeviceModule';
import { JobsModule } from './components/jobs/JobModule';
import { TaskBundleModule } from './components/taskBundle/TaskBundleModule';
import { TasksModule } from './components/tasks/TaskModule';
import { useAuthStore } from './states/auth.store';
import { useThemeStore } from './states/themeStore';
import { DashboardModule } from './types/dashboard-module.interface';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const location = useLocation();
  return isAuthenticated ? children : <Navigate to="/login" state={{ from: location }} replace />;
}

const modules: DashboardModule[] = [
  CustomersModule,
  DevicesModule,
  TasksModule,
  TaskBundleModule,
  JobsModule,
];

function App({}) {
  const { isDarkMode } = useThemeStore();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <div className={isDarkMode ? 'dark' : ''}>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route
            path="/info"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="*"
            element={
              <PrivateRoute>
                <Dashboard modules={modules} />
              </PrivateRoute>
            }
          />
          <Route
            index
            element={
              <PrivateRoute>
                <Dashboard modules={modules} />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
