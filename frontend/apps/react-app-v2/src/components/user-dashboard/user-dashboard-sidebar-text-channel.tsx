import { SidebarMenuItem, SidebarMenuButton } from "../ui/sidebar";
import type { ValueOf } from "@/lib/types/types";
import { PRIVATE_CHANNEL_TYPE } from "@/lib/zod-validation/channel-schema";
import { UserAvatar } from "../user-avatar";
import { UsersRoundIcon } from "lucide-react";

type UserDashboardSidebarTextChannelProps = {
    avatar?: string | null;
    displayName: string;
    channelType: ValueOf<typeof PRIVATE_CHANNEL_TYPE>;
    isActive?: boolean;
    onClick: () => void;
} & Pick<React.ComponentProps<"li">, "ref">;

export function UserDashboardSidebarTextChannel({
    avatar,
    displayName,
    channelType,
    isActive,
    onClick,
    ref,
}: UserDashboardSidebarTextChannelProps) {
    return (
        <SidebarMenuItem ref={ref}>
            <SidebarMenuButton className="cursor-pointer gap-x-1.5 select-none" isActive={isActive} onClick={onClick}>
                {channelType !== PRIVATE_CHANNEL_TYPE.PRIVATE_DIRECT_CHANNEL ? (
                    <UserAvatar displayName={displayName} avatar={avatar} className="size-6 border-none" />
                ) : (
                    <div className="flex size-6 items-center justify-center rounded-full border border-accent bg-primary">
                        <UsersRoundIcon className="size-3 text-primary-foreground" />
                    </div>
                )}
                <span>{displayName}</span>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}
