import { ErrorManager } from "@/components/error/error-manager";
import { GuildSidebar } from "@/components/guild-sidebar/guild-sidebar";
import { AppContent } from "@/components/layout/app-content";
import { GuildHeader } from "@/components/layout/guild-header";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/app/$guildId")({
    component: RouteComponent,
    errorComponent: (errProps) => <ErrorManager {...errProps} />,
});

function RouteComponent() {
    const { guildId } = Route.useParams();
    return (
        <>
            <GuildHeader guildId={guildId} />
            <AppContent>
                <GuildSidebar guildId={guildId} />
                <Outlet />
            </AppContent>
        </>
    );
}
