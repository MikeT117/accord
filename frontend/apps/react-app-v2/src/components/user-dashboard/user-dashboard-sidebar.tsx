import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
} from "@/components/ui/sidebar";
import { UserDashboardSidebarTextChannel } from "./user-dashboard-sidebar-text-channel";
import { useLocation, useNavigate, useParams } from "@tanstack/react-router";
import { HandshakeIcon, UsersRoundIcon } from "lucide-react";
import { Separator } from "../ui/separator";
import { useFilteredPrivateChannels } from "./hooks/use-filtered-private-channels";
import { FilterInput } from "../filter-input";
import { useUser } from "@/lib/zustand/stores/user-store";

export function UserDashboardSidebar() {
    const user = useUser();
    const params = useParams({
        from: "/_auth/app/dashboard/$channelId/",
        shouldThrow: false,
    });

    const navigate = useNavigate();
    const location = useLocation();
    const { channelFilter, filteredChannels, setChannelFilter } = useFilteredPrivateChannels();

    function handlePrivateChannelClick(channelId: string) {
        navigate({
            to: "/app/dashboard/$channelId",
            params: { channelId },
        });
    }

    return (
        <SidebarProvider className="grid grid-cols-1 grid-rows-[50px_1fr] overflow-hidden border-r">
            <SidebarHeader className="border-b">
                <FilterInput
                    filterValue={channelFilter}
                    onChange={setChannelFilter}
                    resultsCount={filteredChannels.length}
                />
            </SidebarHeader>
            <Sidebar collapsible="none" className="flex max-w-[250px] bg-background">
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu className="gap-1">
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        className="py-5"
                                        isActive={location.pathname === "/app/dashboard/relationships"}
                                        onClick={() => navigate({ to: "/app/dashboard/relationships" })}
                                    >
                                        <UsersRoundIcon />
                                        <p className="font-medium">Friends</p>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        className="py-5"
                                        isActive={location.pathname === "/app/dashboard/requests"}
                                        onClick={() => navigate({ to: "/app/dashboard/requests" })}
                                    >
                                        <HandshakeIcon />
                                        <p className="font-medium">Requests</p>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                    <Separator />
                    <SidebarGroup>
                        <SidebarGroupLabel>
                            <span>Direct Messages</span>
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {filteredChannels.map((c) => (
                                    <UserDashboardSidebarTextChannel
                                        key={c.id}
                                        users={c.users}
                                        currentUserId={user.id}
                                        channelType={c.channelType}
                                        isActive={c.id === params?.channelId}
                                        onClick={() => handlePrivateChannelClick(c.id)}
                                    />
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>
        </SidebarProvider>
    );
}
