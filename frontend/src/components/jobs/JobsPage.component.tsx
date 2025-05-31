import { Briefcase, Play } from "lucide-react";
import { DashboardModule } from "../dashboard/dashboard-module.interface";

function JobsPage() {
    // ...your jobs page logic...
    return <div>Jobs Content</div>;
}

export const JobsModule: DashboardModule = {
    route: "/jobs",
    label: "Jobs",
    icon: <Play className="h-4 w-4 mr-2" />,
    Component: JobsPage,
    headerActions: <button>Add Job</button>,
};
