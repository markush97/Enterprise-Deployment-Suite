import { LogOut } from "lucide-react";
import { useAuthStore } from "../../states/auth.store";
import { ThemeToggle } from "./ThemeToggle.component";
import { useNavigate, useLocation } from "react-router-dom";
import { DashboardModule } from "./dashboard-module.interface";


export function Header({ modules }: { modules: DashboardModule[] }) {
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <header className="bg-white shadow dark:bg-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <img
                            src="/logo.png"
                            alt="CWI Logo"
                            className="h-8 mr-4"
                        />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Control Panel</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Manage your systems and customers</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <ThemeToggle />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                            Logged in as <span className="font-medium">{user?.name || 'Anonymous'}</span>
                        </span>
                        <button
                            onClick={logout}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </button>
                    </div>
                </div>

                <div className="mt-4 border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-8">
                        {modules.map((mod) => {
                            const isActive = location.pathname === mod.route;
                            return (
                                <button
                                    key={mod.route}
                                    onClick={() => navigate(mod.route)}
                                    className={
                                        `${isActive
                                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                                        } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                >
                                    {mod.icon}
                                    {mod.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </header>
    )
}
