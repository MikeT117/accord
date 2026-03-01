import { UserDashboardRequests } from "@/components/user-dashboard/user-dashboard-requests";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/app/dashboard/requests")({
    component: UserDashboardRequests,
});
