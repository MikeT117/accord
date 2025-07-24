import { RootErrorComponent } from "@/components/error/error-component";
import { GuildSidebar } from "@/components/guild-sidebar/guild-sidebar";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/app/$guildId")({
    component: RouteComponent,
    errorComponent: (errProps) => <RootErrorComponent {...errProps} />,
});

function RouteComponent() {
    return (
        <>
            <GuildSidebar />
            <Outlet />
        </>
    );
}
