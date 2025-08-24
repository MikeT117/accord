import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/app/$guildId/$channelId")({
    component: RouteComponent,
    errorComponent: ({ error }) => <div>{error.message}</div>,
});

function RouteComponent() {
    return <Outlet />;
}
