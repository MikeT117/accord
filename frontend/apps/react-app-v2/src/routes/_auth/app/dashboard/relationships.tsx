import { UserDashboardFriends } from "@/components/user-dashboard/user-dashboard-friends";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/app/dashboard/relationships")({
    component: UserDashboardFriends,
});
