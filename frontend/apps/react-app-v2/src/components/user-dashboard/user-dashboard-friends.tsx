import { UsersRoundIcon } from "lucide-react";
import { UserDashboardFriendsList } from "./user-dashboard-friends-list";

export function UserDashboardFriends() {
    return (
        <div className="grid grid-cols-1 grid-rows-[50px_1fr] overflow-hidden">
            <div className="flex items-center space-x-1 border-b px-4">
                <UsersRoundIcon className="size-5 text-muted-foreground" />
                <h1 className="font-medium">Friends</h1>
            </div>
            <UserDashboardFriendsList />
        </div>
    );
}
