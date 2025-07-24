import type { GuildTextChannelType, Snapshot } from "@/lib/types/types";
import { HashIcon } from "lucide-react";
import { SidebarMenuSubItem, SidebarMenuSubButton, SidebarMenuItem, SidebarMenuButton } from "../ui/sidebar";

type GuildSidebarTextChannelPropsType = {
    channel: Snapshot<GuildTextChannelType>;
    sub?: boolean;
    isActive?: boolean;
    onClick: () => void;
};

export function GuildSidebarTextChannel({
    channel,
    isActive = false,
    sub = false,
    onClick,
}: GuildSidebarTextChannelPropsType) {
    if (sub) {
        return (
            <SidebarMenuSubItem key={channel.id}>
                <SidebarMenuSubButton className="cursor-pointer select-none" isActive={isActive} onClick={onClick}>
                    <HashIcon /> {channel.name}
                </SidebarMenuSubButton>
            </SidebarMenuSubItem>
        );
    }

    return (
        <SidebarMenuItem key={channel.id}>
            <SidebarMenuButton className="cursor-pointer select-none" isActive={isActive} onClick={onClick}>
                <HashIcon /> {channel.name}
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}
