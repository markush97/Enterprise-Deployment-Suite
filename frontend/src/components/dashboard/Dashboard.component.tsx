import { Route, Routes } from 'react-router-dom';

import { DashboardModule } from '../../types/dashboard-module.interface';
import { AccountPage } from '../account/AccountPage.component';
import { CustomersModule } from '../customers/CustomerModule';
import { DevicesModule } from '../devices/DeviceModule';
import { JobsModule } from '../jobs/JobModule';
import { TaskBundleModule } from '../taskBundle/TaskBundleModule';
import { TasksModule } from '../tasks/TaskModule';
import { Header } from './Header.component';

export interface DashboardProps {
  modules?: DashboardModule[];
}

export function Dashboard({ modules = [] }: DashboardProps) {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header modules={modules}></Header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          {modules.map(mod => (
            <Route key={`${mod.route}/*`} path={`${mod.route}/*`} element={<mod.Component />} />
          ))}
          <Route path="/account" element={<AccountPage />} />
          <Route index element={<div>Select a module</div>} />
        </Routes>
      </main>
    </div>
  );
}
