import { SidebarMenuButton, SidebarMenuItem, SidebarMenuSub } from "@/components/ui/sidebar";
import type { GuildCategoryChannelType, GuildRolePermissionsType } from "@/lib/types/types";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Plus, Minus } from "lucide-react";
import type { ReactNode } from "react";
import { GuildSidebarChannelContextMenu } from "./guild-sidebar-channel-context-menu";
import { useDroppable } from "@dnd-kit/react";
import {
    collapsedCategoryUIStoreActions,
    useCollapsedCategory,
} from "@/lib/zustand/stores/collapsed-categories-ui-store";

type GuildSidebarCategoryChannelProps = {
    permissions: GuildRolePermissionsType;
    channel: GuildCategoryChannelType;
    children: ReactNode;
};

export function GuildSidebarCategoryChannel({ channel, permissions, children }: GuildSidebarCategoryChannelProps) {
    const isOpen = useCollapsedCategory(channel.id);
    const { ref, isDropTarget } = useDroppable({
        id: channel.id,
        data: { parentId: channel.id },
    });

    function handleCollapsibleChange(state: boolean) {
        collapsedCategoryUIStoreActions.setCollapsedCategory(channel.id, state);
    }

    return (
        <Collapsible
            key={channel.id}
            className="group/collapsible"
            open={isOpen}
            onOpenChange={handleCollapsibleChange}
        >
            <SidebarMenuItem>
                <GuildSidebarChannelContextMenu
                    id={channel.id}
                    name={channel.name}
                    guildId={channel.guildId}
                    channelType={channel.channelType}
                    permissions={permissions}
                >
                    <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                            className="cursor-pointer font-medium select-none"
                            ref={ref}
                            isActive={isDropTarget}
                        >
                            {channel.name}
                            <Plus className="ml-auto group-data-[state=open]/collapsible:hidden" />
                            <Minus className="ml-auto group-data-[state=closed]/collapsible:hidden" />
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                </GuildSidebarChannelContextMenu>
                <CollapsibleContent>
                    <SidebarMenuSub>{children}</SidebarMenuSub>
                </CollapsibleContent>
            </SidebarMenuItem>
        </Collapsible>
    );
}
