import type { GuildTextChannelType, Snapshot } from "@/lib/types/types";
import { HashIcon } from "lucide-react";
import { SidebarMenuSubItem, SidebarMenuSubButton, SidebarMenuItem, SidebarMenuButton } from "../ui/sidebar";

type GuildSidebarTextChannelProps = {
    channel: Snapshot<GuildTextChannelType>;
    sub?: boolean;
    isActive?: boolean;
    onClick: () => void;
} & Pick<React.ComponentProps<"li">, "ref">;

export function GuildSidebarTextChannel({
    channel,
    isActive = false,
    sub = false,
    onClick,
    ref,
}: GuildSidebarTextChannelProps) {
    if (sub) {
        return (
            <SidebarMenuSubItem key={channel.id} ref={ref}>
                <SidebarMenuSubButton className="cursor-pointer select-none" isActive={isActive} onClick={onClick}>
                    <HashIcon /> {channel.name}
                </SidebarMenuSubButton>
            </SidebarMenuSubItem>
        );
    }

    return (
        <SidebarMenuItem key={channel.id} ref={ref}>
            <SidebarMenuButton className="cursor-pointer select-none" isActive={isActive} onClick={onClick}>
                <HashIcon /> {channel.name}
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}
