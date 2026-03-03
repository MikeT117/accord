import type { GuildRolePermissionsType, GuildTextChannelType } from "@/lib/types/types";
import { HashIcon } from "lucide-react";
import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import { GuildSidebarChannelContextMenu } from "./guild-sidebar-channel-context-menu";

type GuildSidebarTextChannelProps = {
    channel: GuildTextChannelType;
    isActive?: boolean;
    onClick: () => void;
    permissions: GuildRolePermissionsType;
} & Pick<React.ComponentProps<"button">, "ref">;

export function GuildSidebarTextChannel({
    channel,
    permissions,
    isActive = false,
    onClick,
    ref,
}: GuildSidebarTextChannelProps) {
    return (
        <GuildSidebarChannelContextMenu
            channelType={channel.channelType}
            guildId={channel.guildId}
            id={channel.id}
            name={channel.name}
            permissions={permissions}
        >
            <SidebarMenuItem key={channel.id}>
                <SidebarMenuButton isActive={isActive} onClick={onClick} ref={ref}>
                    <HashIcon />
                    {channel.name}
                </SidebarMenuButton>
            </SidebarMenuItem>
        </GuildSidebarChannelContextMenu>
    );
}
