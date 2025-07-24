import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarProvider,
} from "@/components/ui/sidebar";
import { GuildSidebarCategoryChannel } from "./guild-sidebar-category-channel";
import { GuildSidebarChannel } from "./guild-sidebar-channel";
import { GuildSidebarHeader } from "./guild-sidebar-header";
import { useGuild, useSortedGuildChannels } from "@/lib/valtio/queries/guild-store-queries";
import { useParams } from "@tanstack/react-router";

export function GuildSidebar() {
    const { guildId } = useParams({ from: "/_auth/app/$guildId" });
    const guild = useGuild(guildId);
    const channels = useSortedGuildChannels(guildId);

    return (
        <SidebarProvider>
            <Sidebar collapsible="none" className="flex border-r max-w-[250px] bg-background border-l">
                <SidebarHeader className="border-b p-4">
                    <GuildSidebarHeader id={guild.id} name={guild.name} />
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {channels?.parents.map((parent) => (
                                    <GuildSidebarCategoryChannel key={parent.id} channel={parent}>
                                        {channels.children.map(
                                            (child) =>
                                                parent.id === child.parentId && (
                                                    <GuildSidebarChannel key={child.id} channel={child} sub={true} />
                                                )
                                        )}
                                    </GuildSidebarCategoryChannel>
                                ))}
                                {channels?.orphans &&
                                    channels.orphans.map((c) => <GuildSidebarChannel key={c.id} channel={c} />)}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>
        </SidebarProvider>
    );
}
