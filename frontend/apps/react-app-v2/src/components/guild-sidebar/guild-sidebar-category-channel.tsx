import { SidebarMenuButton, SidebarMenuItem, SidebarMenuSub } from "@/components/ui/sidebar";
import type { GuildCategoryChannelType, Snapshot } from "@/lib/types/types";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Plus, Minus } from "lucide-react";
import type { ReactNode } from "react";
import { GuildSidebarChannelContextMenu } from "./guild-sidebar-channel-context-menu";
import { useCollapsedCategoryUIState } from "@/lib/valtio/queries/collapsed-categories-ui-store-queries";
import { setCollapsedCategoryUIStore } from "@/lib/valtio/mutations/collapsed-categories-ui-store-mutations";
import { useDroppable } from "@dnd-kit/react";

type GuildSidebarCategoryChannelProps = {
    channel: Snapshot<GuildCategoryChannelType>;
    children: ReactNode;
};

export function GuildSidebarCategoryChannel({ channel, children }: GuildSidebarCategoryChannelProps) {
    const isOpen = useCollapsedCategoryUIState(channel.id);
    const { ref, isDropTarget } = useDroppable({
        id: channel.id,
        data: { parentId: channel.id },
    });
    function handleCollapsibleChange(state: boolean) {
        setCollapsedCategoryUIStore(channel.id, state);
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
                >
                    <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="cursor-pointer select-none" ref={ref} isActive={isDropTarget}>
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
