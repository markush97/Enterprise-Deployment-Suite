import { Route, Routes } from "react-router-dom";
import { JobsModule } from "../jobs/JobsPage.component";
import { DashboardModule } from "../../types/dashboard-module.interface";
import { Header } from "./Header.component";
import { DevicesModule } from "../devices/devicesPage.component";
import { AccountPage } from "../account/AccountPage.component";
import { CustomersModule } from "../customers/CustomerList.component";
import { CustomerList } from "../customers/CustomerList.component";
import { CustomerPage } from "../customers/CustomerPage.component";
import { useParams } from 'react-router-dom';
import { useCustomers } from '../../hooks/useCustomers';

const modules: DashboardModule[] = [
    JobsModule,
    DevicesModule,
    CustomersModule
];

export function Dashboard() {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <Header modules={modules}></Header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Routes>
                    <Route path="/customers" element={<CustomerList />} />
                    <Route path="/customers/add" element={<CustomerList />} />
                    <Route path="/customers/:customerid" element={<CustomerPageWrapper />} />
                    <Route path="/customers/:customerid/edit" element={<CustomerList />} />
                    {modules.filter(m => m.route !== '/customers').map((mod) => (
                        <Route key={mod.route} path={mod.route} element={<mod.Component />} />
                    ))}
                    <Route path="/account" element={<AccountPage />} />
                    <Route index element={<div>Select a module</div>} />
                </Routes>
            </main>
        </div>
    );
}

// Wrapper to fetch customer by id and render CustomerPage
function CustomerPageWrapper() {
    const { customerid } = useParams();
    const { customersQuery } = useCustomers();
    const customer = customersQuery.data?.find(c => c.id === customerid);
    if (!customer) return <div className="text-center py-8">Customer not found</div>;
    return <CustomerPage customer={customer} onBack={() => window.history.back()} />;
}
