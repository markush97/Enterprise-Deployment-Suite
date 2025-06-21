import { Route, Routes, useNavigate } from 'react-router-dom';
import { DeviceList } from './DeviceList.component';
import { DeviceDetail } from './DeviceDetail.component';
import { useParams } from 'react-router-dom';
import { useDevices } from '../../hooks/useDevices';
import { DashboardModule } from '../../types/dashboard-module.interface';
import { Monitor } from 'lucide-react';

function DevicePageWrapper() {
    const navigate = useNavigate();
    const { deviceid } = useParams();
    const { devicesQuery } = useDevices();
    const device = devicesQuery.data?.find(d => d.id === deviceid);
    if (!device) return <div className="text-center py-8">Device not found</div>;
    return <DeviceDetail device={device} onBack={() => navigate("/devices")} />;
}

export function DevicesModuleRoutes() {
    return (
        <Routes>
            <Route index element={<DeviceList />} />
            <Route path=":deviceid" element={<DevicePageWrapper />} />
        </Routes>
    );
}

export const DevicesModule: DashboardModule = {
    route: "/devices",
    label: "Devices",
    icon: <Monitor className="h-4 w-4 mr-2" />,
    Component: DevicesModuleRoutes
};
