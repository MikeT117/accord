import type { GuildVoiceChannelType, Snapshot } from "@/lib/types/types";
import { Volume2Icon } from "lucide-react";
import { SidebarMenuItem, SidebarMenuButton, SidebarMenuSubButton, SidebarMenuSubItem } from "../ui/sidebar";

type GuildSidebarVoiceChannelPropsType = {
    channel: Snapshot<GuildVoiceChannelType>;
    sub?: boolean;
    isActive?: boolean;
    onClick: () => void;
};

export function GuildSidebarVoiceChannel({
    channel,
    isActive = false,
    sub = false,
    onClick,
}: GuildSidebarVoiceChannelPropsType) {
    if (sub) {
        return (
            <SidebarMenuSubItem key={channel.id}>
                <SidebarMenuSubButton className="cursor-pointer select-none" isActive={isActive} onClick={onClick}>
                    <Volume2Icon /> {channel.name}
                </SidebarMenuSubButton>
            </SidebarMenuSubItem>
        );
    }

    return (
        <SidebarMenuItem key={channel.id}>
            <SidebarMenuButton isActive={isActive} onClick={onClick}>
                <Volume2Icon /> {channel.name}
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}
