import { Monitor } from "lucide-react";
import { DashboardModule } from "../dashboard/dashboard-module.interface";

function DevicesPage() {
    // ...your jobs page logic...
    return <div>Devices Content</div>;
}

export const DevicesModule: DashboardModule = {
    route: "/devices",
    label: "Devices",
    icon: <Monitor className="h-4 w-4 mr-2" />,
    Component: DevicesPage,
    headerActions: <button>Add Device</button>,
};
