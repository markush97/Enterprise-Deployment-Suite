import { Users } from 'lucide-react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';

import { useCustomers } from '../../hooks/useCustomers';
import { DashboardModule } from '../../types/dashboard-module.interface';
import { CustomerDetail } from './CustomerDetail.component';
import { CustomerList } from './CustomerList.component';

function CustomerPageWrapper({ editMode }: { editMode?: boolean } = {}) {
  const navigate = useNavigate();
  const { customerid } = useParams();
  const { customersQuery } = useCustomers();
  const customer = customersQuery.data?.find(c => c.id === customerid);
  if (!customer) return <div className="text-center py-8">Customer not found</div>;
  return (
    <CustomerDetail customer={customer} onBack={() => navigate('/customers')} editMode={editMode} />
  );
}

export function CustomersModuleRoutes() {
  return (
    <Routes>
      <Route index element={<CustomerList />} />
      <Route path="add" element={<CustomerList />} />
      <Route path=":customerid" element={<CustomerPageWrapper />} />
      <Route path=":customerid/edit" element={<CustomerPageWrapper editMode={true} />} />
    </Routes>
  );
}

export const CustomersModule: DashboardModule = {
  route: '/customers',
  label: 'Customers',
  icon: <Users className="h-4 w-4 mr-2" />,
  Component: CustomersModuleRoutes,
};
