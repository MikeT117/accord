import type { GuildTextChannelType, Snapshot } from "@/lib/types/types";
import { HashIcon } from "lucide-react";
import { SidebarMenuSubItem, SidebarMenuSubButton } from "../ui/sidebar";
import { GuildSidebarChannelContextMenu } from "./guild-sidebar-channel-context-menu";

type GuildSidebarTextChannelProps = {
    channel: Snapshot<GuildTextChannelType>;
    isActive?: boolean;
    onClick: () => void;
} & Pick<React.ComponentProps<"li">, "ref">;

export function GuildSidebarTextChannel({ channel, isActive = false, onClick, ref }: GuildSidebarTextChannelProps) {
    return (
        <GuildSidebarChannelContextMenu
            channelType={channel.channelType}
            guildId={channel.guildId}
            id={channel.id}
            name={channel.name}
        >
            <SidebarMenuSubItem key={channel.id} ref={ref}>
                <SidebarMenuSubButton className="cursor-pointer select-none" isActive={isActive} onClick={onClick}>
                    <HashIcon />
                    <p>{channel.name}</p>
                </SidebarMenuSubButton>
            </SidebarMenuSubItem>
        </GuildSidebarChannelContextMenu>
    );
}
