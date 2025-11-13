import { UserDashboardFriends } from "@/components/user-dashboard/user-dashboard-friends";
import { UserDashboardFriendCreator } from "@/components/user-dashboard/user-dashboard-friends-create";
import { UserDashboardFriendsList } from "@/components/user-dashboard/user-dashboard-friends-list";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/app/dashboard/relationships")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <UserDashboardFriends
            friendCreator={<UserDashboardFriendCreator />}
            friendList={<UserDashboardFriendsList />}
        />
    );
}
