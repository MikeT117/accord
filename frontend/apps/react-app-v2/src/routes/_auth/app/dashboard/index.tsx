import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Dialogs, dialogUIStoreActions } from "@/lib/zustand/stores/dialog-ui-store";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { CastleIcon, EarthIcon, LayoutDashboardIcon } from "lucide-react";

export const Route = createFileRoute("/_auth/app/dashboard/")({
    component: RouteComponent,
});

function RouteComponent() {
    const router = useRouter();

    function handleGuildBrowserClick() {
        router.navigate({ to: "/app/guild-browser" });
    }

    return (
        <div className="flex h-full">
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <LayoutDashboardIcon />
                    </EmptyMedia>
                    <EmptyTitle>Welcome to your dashboard</EmptyTitle>
                    <EmptyDescription>
                        Select a chat from the sidebar, access guilds, friends or create a guild using the app sidebar.
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent className="flex-row justify-center gap-2">
                    <Button variant="outline" onClick={() => dialogUIStoreActions.openDialog(Dialogs.GuildSettings)}>
                        <CastleIcon />
                        <span>Create Guild</span>
                    </Button>
                    <Button variant="outline" onClick={handleGuildBrowserClick}>
                        <EarthIcon />
                        <span>Guild Browser</span>
                    </Button>
                </EmptyContent>
            </Empty>
        </div>
    );
}
