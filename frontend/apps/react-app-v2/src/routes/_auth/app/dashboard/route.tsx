import { ErrorManager } from "@/components/error/error-manager";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { UserDashboardSidebar } from "@/components/user-dashboard/user-dashboard-sidebar";

export const Route = createFileRoute("/_auth/app/dashboard")({
    errorComponent: (errProps) => <ErrorManager {...errProps} />,
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <>
            <UserDashboardSidebar />
            <Outlet />
        </>
    );
}
