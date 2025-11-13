import { RootErrorComponent } from "@/components/error/error-component";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { UserDashboardSidebar } from "@/components/user-dashboard/user-dashboard-sidebar";

export const Route = createFileRoute("/_auth/app/dashboard")({
    component: RouteComponent,
    errorComponent: (errProps) => <RootErrorComponent {...errProps} />,
});

function RouteComponent() {
    return (
        <>
            <UserDashboardSidebar />
            <Outlet />
        </>
    );
}
