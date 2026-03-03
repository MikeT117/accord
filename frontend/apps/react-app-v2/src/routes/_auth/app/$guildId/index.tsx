import { AvatarWithFallback } from "@/components/avatar-with-fallback";
import { ErrorManager } from "@/components/error/error-manager";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Dialogs, dialogUIStoreActions } from "@/lib/zustand/stores/dialog-ui-store";
import { useGuildWithPermissions } from "@/lib/zustand/stores/guild-store";
import { createFileRoute } from "@tanstack/react-router";
import { CogIcon, HashIcon } from "lucide-react";

export const Route = createFileRoute("/_auth/app/$guildId/")({
    component: RouteComponent,
    errorComponent: (errProps) => <ErrorManager {...errProps} />,
});

function RouteComponent() {
    const { guildId } = Route.useParams();
    const { guild, permissions } = useGuildWithPermissions(guildId);

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
                    {permissions.ManageGuildChannel && (
                        <Button
                            variant="outline"
                            onClick={() => dialogUIStoreActions.openDialog(Dialogs.CreateGuildChannel)}
                        >
                            <HashIcon />
                            <span>Create Channel</span>
                        </Button>
                    )}
                    {permissions.ManageGuild && (
                        <Button
                            variant="outline"
                            onClick={() => dialogUIStoreActions.openDialog(Dialogs.GuildSettings)}
                        >
                            <CogIcon />
                            <span>Guild Settings</span>
                        </Button>
                    )}
                </EmptyContent>
            </Empty>
        </div>
    );
}
