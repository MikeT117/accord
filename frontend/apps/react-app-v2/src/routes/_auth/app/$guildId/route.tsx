import { ErrorManager } from "@/components/error/error-manager";
import { GuildSidebar } from "@/components/guild-sidebar/guild-sidebar";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/app/$guildId")({
    component: RouteComponent,
    errorComponent: (errProps) => <ErrorManager {...errProps} />,
});

function RouteComponent() {
    return (
        <>
            <GuildSidebar />
            <Outlet />
        </>
    );
}
