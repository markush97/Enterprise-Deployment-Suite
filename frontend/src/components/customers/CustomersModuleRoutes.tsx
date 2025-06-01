import { Route, Routes } from 'react-router-dom';
import { CustomerList } from './CustomerList.component';
import { CustomerPage } from './CustomerPage.component';
import { useParams } from 'react-router-dom';
import { useCustomers } from '../../hooks/useCustomers';
import { DashboardModule } from '../../types/dashboard-module.interface';
import { Users } from 'lucide-react';

function CustomerPageWrapper() {
    const { customerid } = useParams();
    const { customersQuery } = useCustomers();
    const customer = customersQuery.data?.find(c => c.id === customerid);
    if (!customer) return <div className="text-center py-8">Customer not found</div>;
    return <CustomerPage customer={customer} onBack={() => window.history.back()} />;
}

export function CustomersModuleRoutes() {
    return (
        <Routes>
            <Route path="" element={<CustomerList />} />
            <Route path="add" element={<CustomerList />} />
            <Route path=":customerid" element={<CustomerPageWrapper />} />
            <Route path=":customerid/edit" element={<CustomerList />} />
        </Routes>
    );
}


export const CustomersModule: DashboardModule = {
    route: "/customers",
    label: "Customers",
    icon: <Users className="h-4 w-4 mr-2" />,
    Component: CustomerList
};
