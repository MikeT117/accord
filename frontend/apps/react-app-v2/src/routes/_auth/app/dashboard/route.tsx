import { RootErrorComponent } from "@/components/error/error-component";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { UserDashboardSidebar } from "@/components/user-dashboard/user-dashboard-sidebar";
import { RelationRequestCreatorDialog } from "@/components/relationship-creator/create-relationship-dialog";

export const Route = createFileRoute("/_auth/app/dashboard")({
    errorComponent: (errProps) => <RootErrorComponent {...errProps} />,
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <>
            <UserDashboardSidebar />
            <RelationRequestCreatorDialog />
            <Outlet />
        </>
    );
}
