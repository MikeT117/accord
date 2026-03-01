import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { UserCard } from "./user-card";
import { ReactNode, useState } from "react";
import { useGuildProfileQuery, useUserProfileQuery } from "@/lib/react-query/queries/profile-query";

export function ProfilePopover({
    guildId,
    userId,
    children,
}: {
    guildId?: string;
    userId: string;
    children: ReactNode;
}) {
    const [isProfileOpen, setProfileOpen] = useState(false);
    const guildProfile = useGuildProfileQuery({
        //@ts-ignore - Won't be used based on 'enabled' check
        guildId,
        memberId: userId,
        enabled: !!guildId && isProfileOpen,
    });

    const userProfile = useUserProfileQuery({ userId, enabled: !guildId && isProfileOpen });
    return (
        <Popover open={isProfileOpen} onOpenChange={setProfileOpen} modal={false}>
            <PopoverTrigger asChild>{children}</PopoverTrigger>
            <PopoverContent align="start" className="h-min w-min p-0">
                {guildProfile && (
                    <UserCard
                        displayName={guildProfile.displayName}
                        avatar={guildProfile.avatar}
                        banner={guildProfile.banner}
                        roleIds={guildProfile.roles}
                        guildId={guildProfile.guildId}
                    />
                )}
                {userProfile && (
                    <UserCard
                        displayName={userProfile.displayName}
                        avatar={userProfile.avatar}
                        banner={userProfile.banner}
                    />
                )}
            </PopoverContent>
        </Popover>
    );
}
