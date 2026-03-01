import { AvatarWithFallback } from "@/components/avatar-with-fallback";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { useUserGuildPermissions } from "@/lib/authorisation/permissions";
import { openCreateGuildChannelDialog } from "@/lib/valtio/mutations/create-guild-channel-dialog-ui-store-mutations";
import { openGuildSettings } from "@/lib/valtio/mutations/guild-settings-ui-store-mutations";
import { useGuild } from "@/lib/valtio/queries/guild-store-queries";
import { createFileRoute } from "@tanstack/react-router";
import { CogIcon, HashIcon } from "lucide-react";

export const Route = createFileRoute("/_auth/app/$guildId/")({
    component: RouteComponent,
});

function RouteComponent() {
    const { guildId } = Route.useParams();
    const { ManageGuild, ManageGuildChannel } = useUserGuildPermissions(guildId);
    const guild = useGuild(guildId);

    return (
        <div className="flex h-full">
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="default">
                        <AvatarWithFallback fallback={guild.name} src={guild.icon} size="xxxl" />
                    </EmptyMedia>
                    <EmptyTitle>Welcome to {guild.name}</EmptyTitle>
                    <EmptyDescription>
                        Select a text or voice channel from the sidebar to start chatting with your community.
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent className="flex-row justify-center gap-2">
                    {ManageGuildChannel && (
                        <Button variant="outline" onClick={openCreateGuildChannelDialog}>
                            <HashIcon />
                            <span>Create Channel</span>
                        </Button>
                    )}
                    {ManageGuild && (
                        <Button variant="outline" onClick={openGuildSettings}>
                            <CogIcon />
                            <span>Guild Settings</span>
                        </Button>
                    )}
                </EmptyContent>
            </Empty>
        </div>
    );
}
