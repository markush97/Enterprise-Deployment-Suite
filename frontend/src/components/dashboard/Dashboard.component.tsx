import { Route, Routes } from "react-router-dom";
import { JobsModule } from "../jobs/JobsPage.component";
import { DashboardModule } from "./dashboard-module.interface";
import { Header } from "./Header.component";
import { DevicesModule } from "../devices/devicesPage.component";

const modules: DashboardModule[] = [
    JobsModule,
    DevicesModule
];

export function Dashboard() {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <Header modules={modules}></Header>
            <Routes>
                {modules.map((mod) => (
                    <Route key={mod.route} path={mod.route} element={<mod.Component />} />
                ))}
                {/* Optionally, add a default route */}
                <Route index element={<div>Select a module</div>} />
            </Routes>
        </div>
    );
}
