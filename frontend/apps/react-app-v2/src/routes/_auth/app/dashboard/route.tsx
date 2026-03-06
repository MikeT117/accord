import { ErrorManager } from "@/components/error/error-manager";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { UserDashboardSidebar } from "@/components/user-dashboard/user-dashboard-sidebar";
import { AppContent } from "@/components/layout/app-content";
import { AppHeader } from "@/components/layout/app-header";

export const Route = createFileRoute("/_auth/app/dashboard")({
    errorComponent: (errProps) => <ErrorManager {...errProps} />,
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <>
            <AppHeader>
                <span className="text-sm font-medium text-muted-foreground">Dashboard</span>
            </AppHeader>
            <AppContent>
                <UserDashboardSidebar />
                <Outlet />
            </AppContent>
        </>
    );
}
