import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarProvider,
} from "@/components/ui/sidebar";
import { GuildSidebarCategoryChannel } from "./guild-sidebar-category-channel";
import { GuildSidebarChannel } from "./guild-sidebar-channel";
import { useParams } from "@tanstack/react-router";
import { DnDProvider } from "./guild-sidebar-dnd-provider";
import { GuildSidebarDnDDroppable } from "./guild-sidebar-channel-dnd-droppable";
import { ChevronDownIcon, XIcon } from "lucide-react";
import { GuildSidebarHeaderDropdown } from "./guild-sidebar-header-dropdown";
import { useGuildSidebarState } from "./hooks/use-guild-sidebar-state";

export function GuildSidebar() {
    const { guildId } = useParams({ from: "/_auth/app/$guildId" });
    const { guild, permissions, user, children, orphans, parents } = useGuildSidebarState(guildId);
    return (
        <SidebarProvider className="grid grid-cols-1 grid-rows-[50px_1fr]">
            <GuildSidebarHeaderDropdown
                guildId={guild.id}
                creatorId={guild.creatorId}
                currentUserId={user.id}
                permissions={permissions}
                className="flex items-center justify-between border-r border-b p-4"
            >
                <h1 className="mr-2 truncate font-medium select-none">{guild.name}</h1>
                <ChevronDownIcon size={20} className="group-data-[state=open]/guild-dropdown:hidden" />
                <XIcon size={20} className="group-data-[state=closed]/guild-dropdown:hidden" />
            </GuildSidebarHeaderDropdown>
            <Sidebar collapsible="none" className="h-full max-w-[250px] overflow-hidden border-r bg-background">
                <SidebarContent>
                    <DnDProvider>
                        {!!parents.length && (
                            <SidebarGroup>
                                <SidebarGroupContent>
                                    <SidebarMenu className="gap-1">
                                        {parents.map((parent) => (
                                            <GuildSidebarCategoryChannel
                                                key={parent.id}
                                                channel={parent}
                                                permissions={permissions}
                                            >
                                                {children.map(
                                                    (child) =>
                                                        parent.id === child.parentId && (
                                                            <GuildSidebarChannel
                                                                currentUserId={user.id}
                                                                permissions={permissions}
                                                                key={child.id}
                                                                channel={child}
                                                                sub={true}
                                                            />
                                                        ),
                                                )}
                                            </GuildSidebarCategoryChannel>
                                        ))}
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </SidebarGroup>
                        )}
                        {!!orphans.length && (
                            <SidebarGroup>
                                <SidebarGroupContent>
                                    <SidebarMenu className="gap-1">
                                        {orphans.map((c) => (
                                            <GuildSidebarChannel
                                                key={c.id}
                                                channel={c}
                                                currentUserId={user.id}
                                                permissions={permissions}
                                            />
                                        ))}
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </SidebarGroup>
                        )}
                        <GuildSidebarDnDDroppable />
                    </DnDProvider>
                </SidebarContent>
            </Sidebar>
        </SidebarProvider>
    );
}
