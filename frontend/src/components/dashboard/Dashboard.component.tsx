import { Route, Routes } from "react-router-dom";
import { JobsModule } from "../jobs/JobsPage.component";
import { DashboardModule } from "../../types/dashboard-module.interface";
import { Header } from "./Header.component";
import { DevicesModule } from "../devices/devicesPage.component";
import { AccountPage } from "../account/AccountPage.component";
import { CustomersModule } from '../customers/CustomerModule';
import { TasksModule } from "../tasks/TaskModule";
import { TaskBundleModal } from "../taskBundle/TaskBundleModal.component";
import { TaskBundleModule } from "../taskBundle/TaskBundleModule";

const modules: DashboardModule[] = [
    CustomersModule,
    DevicesModule,
    TasksModule,
    TaskBundleModule,
    JobsModule
];

export function Dashboard() {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <Header modules={modules}></Header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Routes>
                    {modules.map((mod) => (
                        <Route key={`${mod.route}/*`} path={`${mod.route}/*`} element={<mod.Component />} />
                    ))}
                    <Route path="/account" element={<AccountPage />} />
                    <Route index element={<div>Select a module</div>} />
                </Routes>
            </main>
        </div>
    );
}
