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
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { useUser } from "@/lib/valtio/queries/user-store-queries";
import { PRIVATE_CHANNEL_TYPE } from "@/lib/zod-validation/channel-schema";
import { useFilteredPrivateChannels } from "./hooks/use-filtered-private-channels";

export function UserDashboardSidebar() {
    const user = useUser();
    const params = useParams({
        from: "/_auth/app/dashboard/$channelId",
        shouldThrow: false,
    });

    const navigate = useNavigate();
    const location = useLocation();
    const { privateChannels, filter, setFilter } = useFilteredPrivateChannels();

    function handleConversationFilterInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        setFilter(e.currentTarget.value);
    }

    return (
        <SidebarProvider>
            <Sidebar collapsible="none" className="flex max-w-[250px] border-r border-l bg-background">
                <SidebarHeader className="border-b">
                    <Input
                        placeholder="Find a conversation"
                        onChange={handleConversationFilterInputChange}
                        value={filter}
                    />
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
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
                                {privateChannels.map((c) => {
                                    const displayName = c.users
                                        .filter((u) => u.id !== user.id)
                                        .map((u) => u.displayName)
                                        .join(", ");

                                    const avatar =
                                        c.channelType === PRIVATE_CHANNEL_TYPE.PRIVATE_DIRECT_CHANNEL
                                            ? c.users.filter((u) => u.id !== user.id)[0].avatar
                                            : undefined;

                                    return (
                                        <UserDashboardSidebarTextChannel
                                            key={c.id}
                                            avatar={avatar}
                                            channelType={c.channelType}
                                            displayName={displayName}
                                            onClick={() =>
                                                navigate({
                                                    to: "/app/dashboard/$channelId",
                                                    params: { channelId: c.id },
                                                })
                                            }
                                            isActive={c.id === params?.channelId}
                                        />
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>
        </SidebarProvider>
    );
}
