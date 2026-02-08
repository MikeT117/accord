import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import {} from "@/lib/valtio/stores/theme-store";
import type { EventWebsocketType } from "@/lib/websocket/event-ws";

export const Route = createRootRouteWithContext<{
    queryClient: QueryClient;
    eventWebsocket: EventWebsocketType;
}>()({
    component: () => <Outlet />,
});
