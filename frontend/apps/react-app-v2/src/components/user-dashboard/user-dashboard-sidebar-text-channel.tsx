import { SidebarMenuItem, SidebarMenuButton } from "../ui/sidebar";
import type { UserType, ValueOf } from "@/lib/types/types";
import { PRIVATE_CHANNEL_TYPE } from "@/lib/zod-validation/channel-schema";
import { AvatarWithFallback } from "../avatar-with-fallback";
import { AvatarGroup, AvatarGroupCount } from "../ui/avatar";

type UserDashboardSidebarTextChannelProps = {
    channelType: ValueOf<typeof PRIVATE_CHANNEL_TYPE>;
    isActive?: boolean;
    onClick: () => void;
    users: UserType[];
    currentUserId: string;
} & Pick<React.ComponentProps<"li">, "ref">;

export function UserDashboardSidebarTextChannel({
    users,
    currentUserId,
    channelType,
    isActive,
    onClick,
    ref,
}: UserDashboardSidebarTextChannelProps) {
    const displayName = users
        .filter((u) => u.id !== currentUserId)
        .map((u) => u.displayName)
        .join(", ");

    const isPrivateChannel = channelType === PRIVATE_CHANNEL_TYPE.PRIVATE_DIRECT_CHANNEL;
    const totalUsers = users.length - 1;
    const remainingUsers = totalUsers - 3;

    return (
        <SidebarMenuItem ref={ref}>
            <SidebarMenuButton className="cursor-pointer gap-x-1.5 select-none" isActive={isActive} onClick={onClick}>
                {!isPrivateChannel ? (
                    <AvatarWithFallback
                        fallback={displayName}
                        src={users.filter((u) => u.id !== currentUserId)[0].avatar}
                        size="sm"
                    />
                ) : (
                    <AvatarGroup>
                        {users.map(
                            (u, i) =>
                                i < 3 && (
                                    <AvatarWithFallback key={u.id} size="sm" src={u.avatar} fallback={u.displayName} />
                                ),
                        )}
                        {remainingUsers > 0 && <AvatarGroupCount>{remainingUsers}</AvatarGroupCount>}
                    </AvatarGroup>
                )}
                <span>{displayName}</span>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}
