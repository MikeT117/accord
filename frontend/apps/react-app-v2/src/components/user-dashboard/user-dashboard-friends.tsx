import { UsersRoundIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { ValueOf } from "@/lib/types/types";
import { Button } from "../ui/button";

const USER_DASHBOARD_FRIENDS_SECTION = {
    LIST: 0,
    CREATE: 1,
} as const;

type UserDashboardFriendsProps = {
    friendList: ReactNode;
    friendCreator: ReactNode;
};

export function UserDashboardFriends({ friendCreator, friendList }: UserDashboardFriendsProps) {
    const [section, setSection] = useState<ValueOf<typeof USER_DASHBOARD_FRIENDS_SECTION>>(
        USER_DASHBOARD_FRIENDS_SECTION.LIST,
    );

    return (
        <div className="flex w-full flex-col overflow-hidden">
            <div className="flex items-center space-x-2 border-b px-4 py-2.5">
                <div className="flex items-center space-x-2 border-r pr-2">
                    <UsersRoundIcon className="size-5 text-muted-foreground" />
                    <h1 className="font-medium">Friends</h1>
                </div>
                <Button
                    className={section === USER_DASHBOARD_FRIENDS_SECTION.LIST ? "bg-secondary/80" : ""}
                    variant="ghost"
                    size="sm"
                    onClick={() => setSection(USER_DASHBOARD_FRIENDS_SECTION.LIST)}
                >
                    All
                </Button>
                <Button size="sm" onClick={() => setSection(USER_DASHBOARD_FRIENDS_SECTION.CREATE)}>
                    Add Friend
                </Button>
            </div>
            {section === USER_DASHBOARD_FRIENDS_SECTION.LIST && friendList}
            {section === USER_DASHBOARD_FRIENDS_SECTION.CREATE && friendCreator}
        </div>
    );
}
